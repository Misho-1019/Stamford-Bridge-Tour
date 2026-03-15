export type NormalizedFixture = {
    id: string;
    kickoffAt: string;
    isHome: boolean;
    opponent: string;
    competition: string;
};

export interface FixtureProvider {
    getFixtures(daysAhead: number): Promise<NormalizedFixture[]>;
}