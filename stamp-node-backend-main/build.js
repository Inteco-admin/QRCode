const shell = require('shelljs')

const buildFolder = './build/'

const folders = new Set(['./src/views', './src/static'])

// Copy Folders
folders.forEach(folder => {
  shell.cp('-R', folder, buildFolder)
})
