/**
 * Pure Maths Test blueprint selector helpers (no HTTP / env).
 * Used by testApi start payload builders and B3.3 unit tests.
 */

export const MATHS_TEST_DEV_BLUEPRINT = {
  code: 'exalo-maths-mock',
  version: 1,
  purpose: 'development' as const,
};

export type TestBlueprintPurpose = 'production' | 'development';

export type TestStartPayload = {
  user_id: number;
  test_blueprint_code: string;
  test_blueprint_version: number;
  purpose: TestBlueprintPurpose;
};

/** Build the B3.3 development Maths start payload (centralized blueprint + user). */
export function buildMathsDevTestStartPayload(userId: number): TestStartPayload {
  return {
    user_id: userId,
    test_blueprint_code: MATHS_TEST_DEV_BLUEPRINT.code,
    test_blueprint_version: MATHS_TEST_DEV_BLUEPRINT.version,
    purpose: MATHS_TEST_DEV_BLUEPRINT.purpose,
  };
}

/** Routing guard: only Maths uses the Test API in B3.3. */
export function usesMathsTestApi(subject: string | null | undefined): boolean {
  return subject === 'maths';
}
