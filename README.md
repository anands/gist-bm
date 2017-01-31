## Backup & Username Migration Tool for Github Gist

Gist migrate helps you to:

1. Backup your Gists (Public & Private)
2. Change your username in the links to your new username if you have changed it

```txt
$ npm install
$ node gist-bm.js -h
  Usage: node gist-bm.js [options]

  Options:

    -h, --help      output usage information
    -u, --username  Username of the Github account
    -o, --out-dir   Directory to clone the gists
```

### Backup example

```sh
node gist-bm.js -u anands -o backup
Enter access token: 
```

Enter the access token here. Use [github.com/settings/tokens](https://github.com/settings/tokens) to create a new access token if you don't have one, this token should have *gists* permission.

### Username migration

**Change username references:**

Choose the usernames you need to swap, in below example *foo* will be swaped with *bar*.


```sh
find ./ -type f -exec sed -i -e 's/gist.github.com\/foo/gist.github.com\/bar/g' {} \;
```

*Tip: cd into output dir if you have specified one while backup.*

**Commit and push changes:**

```sh
# Not efficient (does push even if there are no changes) but works!
for i in $(ls -1);do cd $i && git add -A && git diff --quiet --exit-code --cached || git commit -m "Username Migration" && git push origin master && cd ..;done
```