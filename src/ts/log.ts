let enabled = true;

function setEnabled(e: boolean): void {
    enabled = e;
}

function message(m: string): void {
    if (enabled) {
        console.log(m);
    }
}

export {
    setEnabled,
    message,
};
