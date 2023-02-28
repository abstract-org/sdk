module.exports = {
    branches: [
        { name: 'main' },
        { name: 'develop', range: '1.x', channel: '1.x' }
    ],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [
            '@semantic-release/github',
            {
                assets: [
                    'CHANGELOG.md',
                    'README.md',
                    'package.json',
                    'dist/**'
                ],
                releasedLabels: false,
                addChannelOnGithubRelease: true,
                message:
                    'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}'
            }
        ],
        '@semantic-release/npm'
    ]
}
