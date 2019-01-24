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
const runTest = (richText) => {
    const options = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: ({ data: { target: { fields }}}) =>
                `<img src="${fields.file.url}" height="${fields.file.details.image.height}" width="${fields.file.details.image.width}" alt="${fields.description}"/>`,
        },
    };
    const html = documentToHtmlString(richText, options);

    console.log(html);

    const transformed = parseHtml(html); // leads to handlFn

    return compare(transformed, richText, ['content', 0], true);
};
/*
const contentful = require('contentful');
const creds = require('../creds.json')
const getContentfulContent = (callback) => {
    contentful.createClient(creds).getEntries({
        content_type: 'sample',
        'fields.name[in]': 'Test',
    }).then((entries) => {
        callback(entries.items[0].fields.richText);
    }).catch((e) => {
        throw e;
    });
};

getContentfulContent(runTest);
/*/

//https://jsonformatter.org/
console.log('Bold, Italic, Underline:' + runTest(require('./boldItalicUnderline.json')));
console.log('ul:' + runTest(require('./ul.json')));
console.log('ol:' + runTest(require('./ul.json')));
//console.log('codeblock:' + runTest(require('./codeblock.json')));
//*/
