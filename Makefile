
start:
	@node-dev --harmony app.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony-generators \
		--require should \
		--reporter spec \
		--bail \

install:
	@npm install
	@mkdir -p public/upload


.PHONY: start test install
