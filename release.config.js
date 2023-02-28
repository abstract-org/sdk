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
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'package.json'],
                message:
                    'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
            }
        ]
    ]
}
