const R = require('ramda');

const nl = (content) => process.stdout.write('\n'+content+'\n');

/**
 * compare original contentful data to generated data
 */
const compare = (transformed, richText, html, extension = [], json) => {
    const gen = R.pathOr('undefined', extension, transformed);
    const cont = R.pathOr('undefined', extension, richText);
    const equal = JSON.stringify(gen) === JSON.stringify(cont);

    if (typeof json === 'boolean') {
        nl('**html**');
        console.log(html);

        if (json) {
            nl('**generated**');
            console.log(JSON.stringify(gen));
            nl('**contentful**');
            console.log(JSON.stringify(cont));
        } else {
            nl('**generated**');
            console.log(gen);
            nl('**contentful**');
            console.log(cont);
        }

        nl('**equal**');
        console.log(equal);
    }

    return equal;
};

const { parseHtml } = require('../index');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
const { BLOCKS } = require('@contentful/rich-text-types');

/**
 * Only for testing our `parseHtml()`
 */
const runTest = (richText, extension = [], json) => {
    const options = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: ({ data: { target: { fields }}}) =>
                `<img src="${fields.file.url}" height="${fields.file.details.image.height}" width="${fields.file.details.image.width}" alt="${fields.description}"/>`,
        },
    };
    const html = documentToHtmlString(richText, options);

    const transformed = parseHtml(html); // leads to handlFn

    return compare(transformed, richText, html, extension, json);
};
/*
const contentful = require('contentful');
//Create a creds.json file with fields `space`, `accessToken`
const creds = require('../creds.json');
const getContentfulContent = () => {
    contentful.createClient(creds).getEntries({
        content_type: 'sample',
        'fields.name[in]': 'Test',
    }).then((entries) => {
        runTest(entries.items[0].fields.richText, [], true);
    }).catch((e) => {
        throw e;
    });
};

getContentfulContent();
/*/
const printRes = (title, file) => {
    const res = runTest(require(file));
    const color = res ? "\x1b[42m" : "\x1b[41m";
    const status = res ? '✓' : '×';

    console.log(color, status, "\x1b[0m", title); //valid
}
//*
//https://jsonformatter.org/
printRes('Bold, Italic, Underline', './boldItalicUnderline.json');
printRes('ul', './ul.json');
printRes('ol', './ol.json');
printRes('hr', './hr.json');
printRes('blockquote', './blockquote.json');
printRes('headings', './headings.json');
printRes('hyperlink', './hyperlink.json');
printRes('codeblock', './codeblock.json');
printRes('Break Things #1', './break1.json');
//Still broken
//console.log('img:' + runTest(require('./img.json'), ['content', 0, 'data', 'target'], false));
//printRes('img', './img.json');
//*/

const htmlTest = (html, testHtml, log = false) => {
    const json = parseHtml(html);
    const options = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: ({ data: { target: { fields }}}) =>
                `<img src="${fields.file.url}" height="${fields.file.details.image.height}" width="${fields.file.details.image.width}" alt="${fields.description}"/>`,
        },
    };
    const newHtml = documentToHtmlString(json, options);
    if(log) {
        nl('** Original **');
        console.log(html);

        nl('** New **');
        console.log(newHtml);

        nl('** Test **');
        console.log(testHtml);

        nl('json');
        console.log(R.pathOr('wrong path', ['content'], json));
    }

    const res = testHtml === newHtml;
    const color = res ? "\x1b[42m" : "\x1b[41m";
    const status = res ? '✓' : '×';
    console.log(color, status, "\x1b[0m", 'htmlTest'); //valid

    if (res === false) {
        console.log("\x1b[31m", `- ${testHtml}`);
        console.log("\x1b[32m", `+ ${newHtml}`);
    }

}


htmlTest(
    '<ul><li><span><span>Do not</span></span></li><li><span><span>You must work.</span></span></li><li><span><span>You may need to risk software.</span></span></li></ul>',
    '<ul><li><p>Do not</p></li><li><p>You must work.</p></li><li><p>You may need to risk software.</p></li></ul>'
);
htmlTest(
    '<ul><li><a href="https://example.com">A link in a list item.</a></li></ul>',
    '<ul><li><p><a href="https://example.com">A link in a list item.</a></p></li></ul>'
)
htmlTest(
    '<p>Before </p><ul><li>Plug-in read</li><li>Copy as<strong> C:\\{Number}</strong></li><li>Please <u>do not </u> the </li><li>Keep a backup</li><li>If  via $<u>{Email}</u></li></ul><h2><strong><a><strong>Lab</strong></a><strong> </strong></strong></h2><ul><li>Used </li><li>Uses </li><li>Access </li></ul><h2><strong><a><strong>Local</strong></a></strong></h2><ul><li>your</li><li>are </li></ul><p><span><span><span><span><span><span><span> </span></span></span></span></span></span></span></p>',
    '<p>Before </p><ul><li><p>Plug-in read</p></li><li><p>Copy as<b> C:\\{Number}</b></p></li><li><p>Please <u>do not </u> the </p></li><li><p>Keep a backup</p></li><li><p>If  via $<u>{Email}</u></p></li></ul><h2><a href=""><b><b>Lab</b></b></a><b><b> </b></b></h2><ul><li><p>Used </p></li><li><p>Uses </p></li><li><p>Access </p></li></ul><h2><a href=""><b><b>Local</b></b></a></h2><ul><li><p>your</p></li><li><p>are </p></li></ul><p> </p>'
);
htmlTest(
    '<p>Next</p><ul><li>Open</li><li>is: <strong>${gateway}</strong></li><li>verify.<br /><strong>-c 3 ${gateway}</strong></li></ul><p><img alt="Screenshot" data-entity-type="file" data-entity-uuid="bb" height="246" src="/sites/default/Test.png" width="485" /></p><ul><li>If contact <u><a href="mailto:Support@test.org">Support@test.org</a></u> assistance.</li></ul>',
    '<p>Next</p><ul><li><p>Open</p></li><li><p>is: <b>${gateway}</b></p></li><li><p>verify.</p><p><b>-c 3 ${gateway}</b></p></li></ul><p><img src="/sites/default/Test.png" height="246" width="485" alt="Screenshot"/></p><ul><li><p>If contact <a href="mailto:Support@test.org"><u>Support@test.org</u></a> assistance.</p></li></ul>'
);
htmlTest(
    '<ul><li>Ping.<br /><strong>ping</strong> test</li></ul>',
    '<ul><li><p>Ping.</p><p><b>ping</b> test</p></li></ul>'
);
htmlTest(
    '<em>Test</em>',
    '<i>Test</i>'
);
//not working
//console.log(htmlTest('<ul><li><a>Ping.<br /><strong>ping</strong> test</a></li></ul>', '<ul><li><a>Ping.<br /><strong>ping</strong> test</a></li></ul>'));
