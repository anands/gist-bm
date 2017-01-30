var request = require('request'),
    exec = require('sync-exec'),
    argv = require('minimist')(process.argv.slice(2)),
    readline = require('readline');

function printHelp() {
    console.log('\n  Usage: node gist-bm.js [options]');
    console.log('');
    console.log('  Options:');
    console.log('');
    console.log('    -h, --help      output usage information');
    console.log('    -u, --username  Username of the Github account');
    console.log('    -o, --out-dir   Directory to clone the gists');
    console.log('\n');
}

if (argv.help || argv.h) {
    printHelp();
    return;
}

var config = {
    'USERNAME': argv.u || argv.username,
    'OUT_DIR': argv.o || argv['out-dir']
}

if (!(config.USERNAME)) {
    console.error("\n  Please specify username!");
    printHelp();
    return;
}

if (config.OUT_DIR) {
    try { require("fs").mkdirSync(config.OUT_DIR); } catch (e) {}
}

var tokenInput = readline.createInterface({ input: process.stdin, output: process.stdout });

tokenInput.question('Enter access token: ', function(token) {
    tokenInput.close();
    if (!token) {
        console.log("Access token is required");
        return;
    }
    config.ACCESS_TOKEN = token;
    var url = 'https://api.github.com/users/' + config.USERNAME + '/gists';
    cloneGists(url);
});

function cloneGists(url) {
    var options = {
            headers: {
                'Authorization': 'token ' + config.ACCESS_TOKEN,
                'User-Agent': 'gist-bm process'
            },
            uri: url
        },
        next = null;

    request(options, function(error, response, body) {
        var headers = response.headers,
            link = headers.link;
        if (link.indexOf("next") != -1) {
            try {
                next = link.split('>; rel="next", <')[0];
                next = next.split('<')[1];
            } catch (e) {
                next = null;
            }
        } else {
            next == null;
        }
        if (!error && response.statusCode == 200) {
            try {
                gists = JSON.parse(body);
                gists.forEach(function(gist) {
                    var gistUrl = gist.git_pull_url;
                    console.info("Cloning: " + gist.description + '(' + gist.id + ')');
                    var cloneCommand = [];
                    if (config.OUT_DIR) {
                        cloneCommand.push('cd ' + config.OUT_DIR + ' && ');
                    }
                    cloneCommand.push('git clone ' + gist.git_pull_url.replace('https://gist.github.com/', 'git@gist.github.com:'));
                    exec(cloneCommand.join(' '));
                });
            } catch (e) {
                console.error(e);
            }

        } else {
            console.log(error);
        }
        if (next) {
            cloneGists(next);
        } else {
            console.log("Clone complete!");
        }
    });
};
