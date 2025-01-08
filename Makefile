debug:
	mkdir -p build
	pnpm exec browserify -t brfs src/app.js > build/regl.js

build:
	mkdir -p build
	pnpm exec browserify -t brfs src/app.js > build/regl.js
	uglifyjs build/regl.js -c -m --in-situ

.PHONY: build debug
