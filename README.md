# yeoman-gulp-webapp
This is a template generated from [generator-gulp-webapp](https://github.com/yeoman/generator-gulp-webapp), with modifications:
- JADE support
- `gulp` for local development
- `gulp build` for builds
- While developing locally:
	- Supports namespaced folders instead of filetype specific folders
	- Compiles css files to same directory as scss files (instead of .tmp)
	- gulp-newer is utilized when the watch task is run, for faster compilation