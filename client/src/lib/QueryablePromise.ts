export default class QueryablePromise {

    isPending = true;
    isRejected = false;
    isResolved = false;

    value: unknown = null;

    public constructor(promise: Promise<unknown>) {
        promise
            .then((value) => {
                this.isResolved = true;
                this.value = value;
            })
            .catch(() => this.isRejected = true)
            .finally(() => this.isPending = false);
    }
}