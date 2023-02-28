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
            '@semantic-release/npm',
            {
                npmPublish: true,
                tarballDist: 'dist'
            }
        ],
        [
            '@semantic-release/github',
            {
                assets: 'dist/*.tgz',
                addReleases: true
            }
        ]
    ]
}
