echo off
set arg=%1
shift
git status
git add .
git pull
git commit -m %arg%
git push