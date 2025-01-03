debug:
	mkdir -p build
	pnpm exec browserify -t brfs src/app.js > build/main.js

build:
	mkdir -p build
	pnpm exec browserify -t brfs src/app.js > build/main.js
	uglifyjs build/main.js -c -m --in-situ

.PHONY: build debug
