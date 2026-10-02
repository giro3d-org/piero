import child_process from 'child_process';

export function getPackageVersion(): string {
    let version = 'unknown';
    try {
        version = child_process
            .execSync('git describe --tags --match "packages-v*" --always')
            .toString();
    } catch {
        // Ignore
    }

    return version;
}
