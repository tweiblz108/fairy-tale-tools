// Requires request and request-promise for HTTP requests
// e.g. npm install request request-promise
const rp = require('request-promise');
// Requires fs to write synthesized speech to a file
const fs = require('fs');
// Requires readline-sync to read command line inputs
const readline = require('readline-sync');
// Requires xmlbuilder to build the SSML body
const xmlbuilder = require('xmlbuilder');

// Gets an access token.
function getAccessToken(subscriptionKey) {
    let options = {
        method: 'POST',
        uri: 'https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

const text = '夜是那么地静，主人那均匀地呼吸声都听得清清楚楚。\n' +
  '\n' +
  '一只蚊子嗡嗡嗡地飞着，在寻找着自己的美食。突然它好像闻到了一股自己喜欢的香味，围着熟睡的主人小心地盘旋着，找准位置用自己那又尖又长的针叮了上去。\n' +
  '\n' +
  '蚊子的身子渐渐地鼓胀起来，它边吸边在心里美滋滋地想着：今天这顿美餐可真是舒服。这样想着又使劲地吸了起来。\n' +
  '\n' +
  '这时，在睡梦中的主人下意识地用手在身上抚摸了下，接着翻了个身继续呼噜了。正津津有味地吸着血的蚊子被惊吓得飞起，感觉自己还没吃饱喝足，它觉得不甘心，于是在主人周围盘旋着。\n' +
  '\n' +
  '“啊，好痒！”睡梦中的主人用手使劲地挠着腿，此时这一阵奇痒已把他的睡意都赶跑了。他醒过来，看着腿上鼓起的大包，用手使劲地挠着，感觉还不能止痒，于是起来找了花露水，喷洒在包包上。躺下想继续美梦。\n' +
  '\n' +
  '闻到味道的蚊子打了个喷嚏，想着：我还是先到别处兜一圈再说。它盘旋了一大圈，没发现让自己感到特别喜欢的地方，它觉得自己还没吃饱喝足，不甘心就这么离开，于是又飞回来，飞到主人的身边。看着躺着的主人，围着他嗡嗡嗡地飞着，视机在寻找再次下口的机会。\n' +
  '\n' +
  '当蚊子再一次飞过主人的身边，只听“啪”的一声清脆响，伴随着主人惊叫道：“哇，好多血！”抬手看到手上一滩殷红的血加上一个蚊子的尸体。'

// Make sure to update User-Agent with the name of your resource.
// You can also change the voice and output formats. See:
// https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support#text-to-speech
function textToSpeech(accessToken, text) {
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'en-us')
        .ele('voice')
        .att('xml:lang', 'en-us')
        .att('name', 'zh-CN-XiaoxiaoNeural')
        .txt(text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();

    let options = {
        method: 'POST',
        baseUrl: 'https://eastus.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'Youtube',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    let request = rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                request.pipe(fs.createWriteStream('TTSOutput.wav'));
                console.log('\nYour file is ready.\n')
            }
        });
    return request;
}

// Use async and await to get the token before attempting
// to convert text to speech.
async function main() {
    // Reads subscription key from env variable.
    // You can replace this with a string containing your subscription key. If
    // you prefer not to read from an env variable.
    // e.g. const subscriptionKey = "your_key_here";
    const subscriptionKey = '475631d22a44428991407d00104039dd';
    if (!subscriptionKey) {
        throw new Error('Environment variable for your subscription key is not set.')
    };
    // Prompts the user to input text.
    // const text = readline.question('What would you like to convert to speech? ');

    try {
        const accessToken = await getAccessToken(subscriptionKey);
        await textToSpeech(accessToken, text);
    } catch (err) {
        console.log(`Something went wrong: ${err}`);
    }
}

main()
