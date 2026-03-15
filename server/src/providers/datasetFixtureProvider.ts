import { fixtureDataset } from "../data/fixtures";
import { FixtureProvider, NormalizedFixture } from "../types/fixture";

export class DatasetFixtureProvider implements FixtureProvider {
    async getFixtures(daysAhead: number): Promise<NormalizedFixture[]> {
        return fixtureDataset.slice(0, Math.max(daysAhead, 0));
    }
}