require("chromedriver");
const { By, Key, Builder } = require("selenium-webdriver");
const links = require('./links.json');
const translate = require('@vitalets/google-translate-api');
const admin = require('firebase-admin');
var serviceAccount = require("./novel-db-c6b6d-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://novel-db-c6b6d-default-rtdb.firebaseio.com"
});

const db = admin.database();
const ref = db.ref('novel');
// the ethernal club
const novelRef = ref.child('01');

async function translateToThai(content) {
	let text = content.split('');  // >5k chars
	const chunks = [];
	while (text.length) chunks.push(text.splice(0, 5000).join(''));
	for (let chunk of chunks) {
		chunk = await translate(chunk, {to: 'th'});
	}

	return chunks.join('');
}

async function scraping(url, className) {

	//To wait for browser to build and launch properly
	let driver = await new Builder().forBrowser("chrome").build();

	await driver.get(url);

	//To send a search query by passing the value in searchString.
	let par = await driver.findElement(By.className(className));
	let content = await par.getText();

	//It is always a safe practice to quit the browser after execution
	await driver.quit();
	let translatedContent = await translateToThai(content);
	return translatedContent;

}

async function main() {
	let index = 1;
	for (const link of links) {
		const content = await scraping(link, 'content');
		console.log(`Done chapter: ${index}`);
		novelRef.child('chapters').child(`${index}`).set({
			content,
			index,
		});
		index++;
	}

}

main();

// function get() {
// 	novelRef.once('value', (snapshot) => {
// 		console.log('value');
// 		novelRef.set({
// 			chapters: snapshot.val(),
// 			title: 'The Ethernal Club',
// 		});
// 	}, (errorObject) => {
// 		console.log('The read failed: ' + errorObject.name);
// 	});
// }

// get();
