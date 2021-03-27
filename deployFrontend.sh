rsync -r src/ docs/
rsync build/contracts/* docs/
git add .
git commit -m "Compiles assests for Github Pages 1.0"
git push -u origin master
