import fs from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import semver from 'semver';

/**
 * Checks that all packages have a version that matches the git tag.
 *
 * The git tag must follow the naming convention: packages-v1.2.3-beta.1234
 *
 * If validation is successful, the NPM channel is written to the console.
 *
 * The channel is the first element of the preversion, if applicable.
 *
 * e.g:
 *
 * 1.2.3        : no preversion, channel is "latest" (default)
 * 1.2.3-beta.0 : channel is "beta"
 * 1.2.3-rc.5   : channel is "rc"
 */

const allowedTags = ['alpha', 'beta', 'rc'];
const rootDir = process.argv[2];

const gitTag = process.argv[3];
const gitTagRegex = /^packages-v([0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta|rc)\.\d+)?)$/;
const gitTagMatch = gitTag.match(gitTagRegex);

if (gitTagMatch === null || gitTagMatch.length < 2) {
    console.error(`FATAL: Could not extract version from git tag: ${gitTag}.`);
    exit(1);
}

const gitTagVersion = gitTagMatch[1];

const versions = [];

for (const dir of fs.readdirSync(rootDir)) {
    const content = fs.readFileSync(path.join(rootDir, dir, 'package.json'), { encoding: 'utf-8' });
    const pkg = JSON.parse(content);

    if (gitTagVersion !== pkg.version) {
        console.error(
            `FATAL: package '${dir}' does not have the same version (${pkg.version}) as the git tag (${gitTagVersion}). All packages must have exactly the same version.`,
        );
        exit(1);
    }

    versions.push(pkg.version);
}

const prerelease = semver.prerelease(versions[0]);

if (prerelease) {
    const channel = prerelease[0];

    if (typeof channel === 'string' && allowedTags.includes(channel)) {
        console.log(channel);
    }
} else {
    // This is the NPM default but we mention it for symmetry
    console.log('latest');
}
