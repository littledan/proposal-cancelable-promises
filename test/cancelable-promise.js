import CancelablePromise from "../lib/cancelable-promise";
import delay from "./helpers/delay.js";
const assert = require("assert");

describe("Basic onCanceled and .cancel() interaction", () => {
  it("should call the onCanceled handler when canceling a forever-pending promise", () => {
    let called = false;
    const p = new CancelablePromise(() => {}, () => called = true);

    p.cancel();

    assert(called, "onCanceled should be called");
  });

  it("should not call the onCanceled handler when canceling an immediately-fulfilled promise", () => {
    let called = false;
    const p = new CancelablePromise(resolve => resolve(), () => called = true);

    p.cancel();

    assert(!called, "onCanceled should not be called");
  });

  it("should not call the onCanceled handler when canceling an immediately-rejected promise", () => {
    let called = false;
    const p = new CancelablePromise((resolve, reject) => reject(), () => called = true);

    p.cancel();

    assert(!called, "onCanceled should not be called");
  });

  it("should not call the onFulfilled or onRejected handlers for a promise that resolves after cancelation", () => {
    let resolve;
    const p = new CancelablePromise(r => resolve = r, () => {});

    let calledOnFulfilled = false;
    let calledOnRejected = false;
    p.then(() => calledOnFulfilled = true, () => calledOnRejected = true);

    p.cancel();
    resolve();

    return delay().then(() => {
      assert(!calledOnFulfilled, "onFulfilled should not be called")
      assert(!calledOnRejected, "onRejected should not be called")
    });
  });

  it("should not call the onFulfilled handler for a promise that resolves after cancelation", () => {
    let reject;
    const p = new CancelablePromise((r, rr) => reject = rr, () => {});

    let calledOnFulfilled = false;
    let calledOnRejected = false;
    p.then(() => calledOnFulfilled = true, () => calledOnRejected = true);

    p.cancel();
    reject();

    return delay().then(() => {
      assert(!calledOnFulfilled, "onFulfilled should not be called")
      assert(!calledOnRejected, "onRejected should not be called")
    });
  });
});

describe("Cancelation propagation through non-branching chains", () => {
  it("should not allow CancelablePromise.prototype.then to be called on non-CancelablePromises", () => {
    assert.throws(() => CancelablePromise.prototype.then.call(Promise.resolve()), TypeError);
    assert.throws(() => CancelablePromise.prototype.then.call({ then() { } }), TypeError);
  });

  it("should call the original onCanceled handler when canceling a derived promise", () => {
    let called = false;
    const p = new CancelablePromise(() => {}, () => called = true);

    p.then().cancel();

    assert(called, "onCanceled should be called");
  });
});
