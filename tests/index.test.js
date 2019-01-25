/**
 * return in console
 */
const nl = (content) => process.stdout.write('\n'+content+'\n');

const R = require('ramda');
const iFetch = require('isomorphic-fetch');

//https://github.com/contentful/contentful-migration
const { runMigration } = require('contentful-migration/built/bin/cli');

const getDrupalContent = (id) => {
    /*
    const contentHost = "https://content.sans.org/lab-instructions?_format=json";
    /*/
    const contentHost = "https://content.sans.org/lab-instruction-blurbs?_format=json";
    //*/

    iFetch(contentHost, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        requestContext: {
            authorizer: {
                sansAccountID: '2709112', // Charlie's employee account
                isEmployee: 'yes',
            },
        },
    }).then((resp) => {
        if (!resp.ok) {
            console.log('ERROR');
        }
        resp.json().then((data) => {
            console.log(data)
        });
    });
};

/**
 * Don't use this.... look at `cli space import/export`
 * https://github.com/contentful/contentful-cli/tree/master/docs/space
 */
const putContent = () => {
    const opts = {
        filePath: '/Users/smcclaine/Documents/Projects/cmp/cmp_lambda/src/utils/contentful/migration.js',
        spaceId: 'gedg1u5b0yz9',
        accessToken: 'bb7d26f060d68e894175a532bf3d6c04385d8eda9aa7e62bbd00ff6a5547162a',
        yes: true,
    };

    runMigration(opts)
        .then(() => console.log('Migration Complete!'))
        .catch((e) => console.error(e));
};
//----------------------------------------------------------------------------
/**
 * compare original contentful data to generated data
 */
const compare = (transformed, richText, extension = [], json) => {
    const gen = R.pathOr('undefined', extension, transformed);
    const cont = R.pathOr('undefined', extension, richText);
    const equal = JSON.stringify(gen) === JSON.stringify(cont);

    if (typeof json === 'boolean') {
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
/**
 * parse me some html
 */

const { parseHtml } = require('../index');
/*
 * Print out content from contentful
 */
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

    if(typeof json === 'boolean') {
        console.log(html);
    }

    const transformed = parseHtml(html); // leads to handlFn

    return compare(transformed, richText, extension, json);
};
/*
const contentful = require('contentful');
const creds = require('../creds.json')
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
    const status = res ? 'passed' : 'failed';
    console.log(color, status, "\x1b[0m", title);
}

//https://jsonformatter.org/
printRes('Bold, Italic, Underline', './boldItalicUnderline.json');
printRes('ul', './ul.json');
printRes('ol', './ol.json');
printRes('hr', './hr.json');
printRes('blockquote', './blockquote.json');
printRes('headings', './headings.json')
//Still broken
console.log('codeblock:' + runTest(require('./codeblock.json'), ['content', 0], true));
printRes('codeblock', './codeblock.json');
console.log('hyperlink:' + runTest(require('./hyperlink.json'), ['content', 0, 'content'], false));
printRes('hyperlink', './hyperlink.json');
//*/
