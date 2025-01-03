debug:
	mkdir -p build
	pnpm exec browserify -t brfs src/app.js > build/main.min.js

build:
	mkdir -p build
	pnpm exec browserify -t brfs src/app.js > build/main.min.js
	uglifyjs build/main.min.js -c -m --in-situ

.PHONY: build debug
