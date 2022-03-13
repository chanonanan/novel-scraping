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
	const translatedChunks = [];
	while (text.length) chunks.push(text.splice(0, 5000).join(''));
	for (const chunk of chunks) {
		const translatedChunk = await translate(chunk, {to: 'th'});
		translatedChunks.push(translatedChunk.text);
	}

	return translatedChunks.join('');
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
	let index = 371;
	for (const link of links.slice(370)) {
		const content = await scraping(link, 'content');
		console.log(`Done chapter: ${index}`);
		novelRef.child('chapters').child(`${index}`).set({
			content,
			index,
		});
		index++;
	}

}

// main();

async function get() {
	novelRef.child('chapters').once('value', async (snapshot) => {
		const chapters = snapshot.val();
		// let i = 501;
		// while (chapters[i]) {
		// 	let translatedContent = await translateToThai(chapters[i].content);
		// 	novelRef.child(`chapters/${i}/content`).set(translatedContent);
		// 	console.log(`Done chapter: ${i}`);
		// 	i++;
		// }

        const chaptersObj = {};
        let i = 1;
        while (chapters[i]) {
            chaptersObj[i] = { title: `ตอนที่ ${i}`, content: chapters[i].content };
            i++;
        }

        const uuid = 'theEternalClub';

        db.ref('novels').set({
            [uuid]: {
                display: true
            }
        });

        db.ref('details').set({
            [uuid]: {
                title: 'The Eternal Club',
                description: `Lu Li ใช้เวลาหลายปีในการโลดโผนในเซี่ยงไฮ้โดยไม่บรรลุสิ่งใดหรือไม่เห็นความหวังใด ๆ ในอนาคต…เขาไม่ต้องการให้ชีวิตของเขายังคงเป็นแบบนี้ เขาต้องการที่จะกลายเป็นบุคคลที่มีอิทธิพลด้วยเงิน อำนาจ และผู้หญิง แต่…แต่เขาเป็นเพียงผู้ชายธรรมดาอีกคนหนึ่งบนถนน!\n
                คืนหนึ่งที่ฝนตก Lu Li ได้รับความสามารถพิเศษ ตอนนี้เขาสามารถซื้อชีวิตหลายปีจากผู้คนและขายปีเหล่านี้ให้ผู้อื่นได้ เขาสามารถเร่งความเร็วและช้าลงได้ตลอดเวลาที่เขาต้องการ\n
                ดังนั้น Lu Li จึงเริ่มต้นการเดินทางของเขา ท้าทายกฎแห่งธรรมชาติและเปลี่ยนแปลงชีวิตมากมายในขณะที่เขาปีนขึ้นไปสู่ความยิ่งใหญ่ เขากำลังจะสร้างคลับที่พิเศษและพรีเมียมที่สุดในโลก - The Eternal Club!`
            }
        });

        db.ref('chapters').set({
            [uuid]: chaptersObj
        });

	}, (errorObject) => {
		console.log('The read failed: ' + errorObject.name);
	});
}

get();
