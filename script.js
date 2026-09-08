    const form = document.getElementById('sequence');
    const input = document.getElementById('n');
    const output = document.getElementById('output');

    function logNLength(value) {
        console.log(value.replace(/^-/, '').length);
    }

    function getIndexFileName(value) {
        return `index_${value.length}${value.length === 1 ? 'digit' : 'digits'}.bin`;
    }

    function getArchiveIndexUrl(fileName) {
    const archiveUrl = `https://ia600509.us.archive.org/28/items/aha-ha-pisearch-indexes/${fileName}`;
    return  archiveUrl;
    }

    function showError(message) {
        output.textContent = message;
    }

    function clearOutput() {
        output.textContent = '';
    }

    function validateInput(value) {
        if (!value) return null;
        if (value.startsWith('-')) return 'Error: input must not be negative.';
        if (!/^\d+$/.test(value)) return 'Error: input must be a number.';
        if (value.length < 1 || value.length > 8) {
            return 'Error: input length must be between 1 and 8 digits.';
        }
        return null;
    }

    async function fetchIndexedValue(value) {
        const fileName = getIndexFileName(value);
        const start = Number(value) * 8;
        const end = start + 7;

        const fileUrl = `https://cors.raban.dev/?url=https://github.com/aha-ha/pisearch/releases/download/v1.0.0/${fileName}`;

        const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'Range': `bytes=${start}-${end}`
            }
        });

        if (response.status !== 206) {
            throw new Error(`HTTP ${response.status}: Range request failed`);
        }

        const buffer = await response.arrayBuffer();
        const view = new DataView(buffer);
        return view.getBigUint64(0, true);
    }

    async function handleValue(value) {
        const error = validateInput(value);

        if (error) {
            showError(error);
            return;
        }

        clearOutput();
        logNLength(value);

        try {
            const position = await fetchIndexedValue(value);
            output.textContent = `Position in Pi: ${position.toString()}`;
        } catch (error) {
            showError(`Error: ${error.message}`);
        }
    }

    const currentUrl = new URL(window.location.href);
    const initialValue = currentUrl.searchParams.get('n');

    if (initialValue !== null) {
        input.value = initialValue;
        void handleValue(initialValue);
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const value = input.value.trim();
        const error = validateInput(value);

        if (error) {
            showError(error);
            return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set('n', value);

        window.history.replaceState({}, '', url);
        void handleValue(value);
    });