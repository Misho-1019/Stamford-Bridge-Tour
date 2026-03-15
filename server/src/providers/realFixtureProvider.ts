import axios from "axios";
import { DateTime } from "luxon";
import { FixtureProvider, NormalizedFixture } from "../types/fixture";

type FootballDataMatch = {
    id: number;
    utcDate: string;
    status: string;
    homeTeam: {
        name: string;
        shortName?: string;
        tla?: string;
    };
    awayTeam: {
        name: string;
        shortName?: string;
        tla?: string;
    };
    competition?: {
        name?: string;
        code?: string;
    };
};

type FootballDataMatchesResponse = {
    matches: FootballDataMatch[];
};

const LONDON_TZ = "Europe/London";

function isChelsea(name?: string, shortName?: string, tla?: string) {
    const values = [name, shortName, tla].filter(Boolean).map((v) => v!.toLowerCase());
    return values.includes("chelsea") || values.includes("che") || values.includes("chelsea fc");
}

export class RealFixtureProvider implements FixtureProvider {
    async getFixtures(daysAhead: number): Promise<NormalizedFixture[]> {
        const apiKey = process.env.FOOTBALL_DATA_API_KEY;
        const competition = process.env.FOOTBALL_DATA_COMPETITION || "PL";

        if (!apiKey) {
            throw new Error("FOOTBALL_DATA_API_KEY is not configured");
        }

        const dateFrom = DateTime.now().setZone(LONDON_TZ).toFormat("yyyy-MM-dd");
        const dateTo = DateTime.now()
            .setZone(LONDON_TZ)
            .plus({ days: daysAhead })
            .toFormat("yyyy-MM-dd");

        const response = await axios.get<FootballDataMatchesResponse>(
            `https://api.football-data.org/v4/competitions/${competition}/matches`,
            {
                params: {
                    dateFrom,
                    dateTo,
                },
                headers: {
                    "X-Auth-Token": apiKey,
                },
            }
        );

        const matches = response.data.matches ?? [];

        return matches
            .filter((match) => {
                const homeIsChelsea = isChelsea(
                    match.homeTeam?.name,
                    match.homeTeam?.shortName,
                    match.homeTeam?.tla
                );
                const awayIsChelsea = isChelsea(
                    match.awayTeam?.name,
                    match.awayTeam?.shortName,
                    match.awayTeam?.tla
                );

                return homeIsChelsea || awayIsChelsea;
            })
            .map((match) => {
                const homeIsChelsea = isChelsea(
                    match.homeTeam?.name,
                    match.homeTeam?.shortName,
                    match.homeTeam?.tla
                );

                return {
                    id: String(match.id),
                    kickoffAt: match.utcDate,
                    isHome: homeIsChelsea,
                    opponent: homeIsChelsea ? match.awayTeam.name : match.homeTeam.name,
                    competition: match.competition?.name || competition,
                };
            });
    }
}