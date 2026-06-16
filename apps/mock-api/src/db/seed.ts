import { getDb } from './connection.js';
import { migrate } from './migrate.js';

interface SeedRow {
	Nhs: string;
	CaseNo: string;
	Volume: number;
	LocHeld: string;
	Holder: string | null;
	Status: string;
	BaseLocation: string;
	Creator: string;
	AddInfo: string | null;
	/** Days ago the record was last updated, used to vary timestamps. */
	updatedDaysAgo: number;
}

const SEED_ROWS: SeedRow[] = [
	{
		Nhs: '943 476 5919',
		CaseNo: 'CN-100482',
		Volume: 1,
		LocHeld: 'WARD4',
		Holder: 'Sister J. Hughes',
		Status: 'Active',
		BaseLocation: 'MRL',
		Creator: 'a.morgan',
		AddInfo: 'Requested for ward round review.',
		updatedDaysAgo: 0
	},
	{
		Nhs: '485 777 3456',
		CaseNo: 'CN-100517',
		Volume: 2,
		LocHeld: 'THEATRE',
		Holder: 'Theatre Coordinator',
		Status: 'In transit',
		BaseLocation: 'MRL',
		Creator: 'r.davies',
		AddInfo: 'Pre-op notes for elective list.',
		updatedDaysAgo: 1
	},
	{
		Nhs: '624 112 8890',
		CaseNo: 'CN-100533',
		Volume: 1,
		LocHeld: 'OPD',
		Holder: 'Outpatients Reception',
		Status: 'Active',
		BaseLocation: 'MRL',
		Creator: 'l.evans',
		AddInfo: null,
		updatedDaysAgo: 2
	},
	{
		Nhs: '771 905 2240',
		CaseNo: 'CN-100571',
		Volume: 1,
		LocHeld: 'ED',
		Holder: 'ED Clerk',
		Status: 'Active',
		BaseLocation: 'MRL',
		Creator: 'a.morgan',
		AddInfo: 'Pulled for emergency attendance.',
		updatedDaysAgo: 3
	},
	{
		Nhs: '208 661 4477',
		CaseNo: 'CN-100598',
		Volume: 3,
		LocHeld: 'MRL',
		Holder: null,
		Status: 'Active',
		BaseLocation: 'MRL',
		Creator: 'system',
		AddInfo: 'Returned to library shelving.',
		updatedDaysAgo: 5
	},
	{
		Nhs: '550 348 1029',
		CaseNo: 'CN-100604',
		Volume: 1,
		LocHeld: 'RADIOLOGY',
		Holder: 'Imaging Admin',
		Status: 'In transit',
		BaseLocation: 'MRL',
		Creator: 'r.davies',
		AddInfo: 'Accompanying imaging request.',
		updatedDaysAgo: 7
	}
];

function isoDaysAgo(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date.toISOString();
}

export function seed(): number {
	migrate(true);
	const db = getDb();

	const insert = db.prepare(`
		INSERT INTO case_notes
			(Nhs, CaseNo, Volume, LocHeld, Holder, Status, BaseLocation, Creator, CreateDate, SyncDate, AddInfo)
		VALUES
			(@Nhs, @CaseNo, @Volume, @LocHeld, @Holder, @Status, @BaseLocation, @Creator, @CreateDate, @SyncDate, @AddInfo)
	`);

	const insertMany = db.transaction((rows: SeedRow[]) => {
		for (const row of rows) {
			const createDate = isoDaysAgo(row.updatedDaysAgo + 14);
			insert.run({
				Nhs: row.Nhs,
				CaseNo: row.CaseNo,
				Volume: row.Volume,
				LocHeld: row.LocHeld,
				Holder: row.Holder,
				Status: row.Status,
				BaseLocation: row.BaseLocation,
				Creator: row.Creator,
				CreateDate: createDate,
				SyncDate: isoDaysAgo(row.updatedDaysAgo),
				AddInfo: row.AddInfo
			});
		}
	});

	insertMany(SEED_ROWS);
	return SEED_ROWS.length;
}

const invokedDirectly = process.argv[1]?.endsWith('seed.ts') ?? false;
if (invokedDirectly) {
	const count = seed();
	console.log(`[seed] inserted ${count} case note tracking records.`);
}
