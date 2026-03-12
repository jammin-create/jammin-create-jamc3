import { describe, test, expect, beforeAll } from "bun:test";
import {
  createWorkReportAsync,
  generateServiceOutput,
  simulateAccumulation,
  ServiceId,
  Gas,
  generateState,
  State,
  ServiceBuildOutput,
} from "@fluffylabs/jammin-sdk";
import { Slot } from "@fluffylabs/jammin-sdk";

describe("Example service integration tests", () => {
  let service: ServiceBuildOutput;
  let state: State;

  beforeAll(async () => {
    // Load pre-built service from .jam file
    // Make sure to run `jammin build` before running tests
    service = await generateServiceOutput(
      "./services/example/service.jam",
      0 // ServiceId
    );

    // Create initial state with service registered
    state = await generateState([service]);
  });

  test("should successfully accumulate work report", async () => {
    // Example timeslot of accumulation
    const slot = Slot(42);

    // Create a work report for the service
    const report = await createWorkReportAsync({
      results: [
        {
          serviceId: ServiceId(0),
          gas: Gas(50000),
          result: { type: "ok" },
        },
      ],
    });


    // Simulate accumulation
    const result = await simulateAccumulation(state, [report], {
      slot,
      debug: true,
    });

    // Update state with accumulation result
    state.applyUpdate(result.stateUpdate);

    // Assert on results
    expect(result).toBeDefined();
    expect(result.stateUpdate).toBeDefined();
    expect(result.accumulationStatistics.size).toBe(1);
  });
});
