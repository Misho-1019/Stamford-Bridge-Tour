import axios from "axios";
import { FixtureProvider, NormalizedFixture } from "../types/fixture";
import { DateTime } from "luxon";

type ApiFootballFixture = {
    fixture: {
        id: number;
        date: string;
    };
    teams: {
        home: {
            name: string;
        };
        away: {
            name: string;
        };
    };
    league: {
        name: string;
    };
};

export class RealFixtureProvider implements FixtureProvider {
    async getFixtures(daysAhead: number): Promise<NormalizedFixture[]> {
        const apiKey = process.env.FIXTURES_API_KEY;

        if (!apiKey) {
          throw new Error("FIXTURES_API_KEY is not configured");
        }

        const today = DateTime.now().setZone('Europe/London').toISODate();
        const to = DateTime.now()
            .setZone('Europe/London')
            .plus({ days: daysAhead })
            .toISODate();
        
        const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
            params: {
                team: 49,
                from: today,
                to,
                season: 2025,
            },
            headers: {
                "x-apisports-key": apiKey,
            },
        });

        const fixtures: ApiFootballFixture[] = response.data?.response ?? [];

        return fixtures.map((fixture) => ({
            id: String(fixture.fixture.id),
            kickoffAt: fixture.fixture.date,
            isHome: fixture.teams.home.name.toLowerCase() === 'chelsea',
            opponent:
                fixture.teams.home.name.toLowerCase() === 'chelsea'
                    ? fixture.teams.away.name
                    : fixture.teams.home.name,
                competition: fixture.league.name,
        }))
    }
}