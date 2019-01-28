const htmlParser = require('htmlparser');
const R = require('ramda');

const htmlAttrs = {
    tag: {
        ul: 'unordered-list',
        ol: 'ordered-list',
        li: 'list-item',
        blockquote: 'blockquote',
        p: 'paragraph',
        h1: 'heading-1',
        h2: 'heading-2',
        h3: 'heading-3',
        h4: 'heading-4',
        h5: 'heading-5',
        h6: 'heading-6',
        hr: 'hr',
        a: 'hyperlink',
        b: 'bold',
        strong: 'bold',
        code: 'text',
        i: 'italic',
        em: 'italic',
        u: 'underline',
        img: 'embedded-asset-block',
    },
    text: 'text',
};

let transformed = []; //What should come out in the end

const transformDom = (dom) => {
    let results = [];

    R.forEach((elm) => {
        const { type, name, data, attribs, children } = elm;
        //console.log(elm);
        let content = [];
        let newData = {};
        if (children) {
            //console.log(children);
            content = transformDom(children);
        }

        if (type === 'text') {
            newData = {
                data: {},
                marks: [],
                value: data,
                nodeType: type,
            };
        } else if (type === 'tag') {
            if (!htmlAttrs[type][name]) {
                console.log('*** new data needed under', type, name);
                //console.log(elm);
            }

            if (name === 'code') {
                const Entities = require('html-entities').XmlEntities;
                const entities = new Entities();

                newData = R.map((node) => {
                    node = R.assoc('value', entities.decode(node.value), node);
                    node = R.assoc('marks', R.append({type: 'code'}, node.marks), node);
                    return node;
                }, content);
            } else if (name === 'img') {
                const fileName = R.last(R.split('/', attribs.src));

                newData = {
                    data: {
                        target: {
                            sys: {
                                space: {},
                                type: 'Asset',
                                createdAt: '',
                                updatedAt: '',
                                environment: {},
                                revision: null,
                                locale: 'en-US',
                            },
                            fields: {
                                title: R.head(R.split('.', fileName)),
                                description: attribs.alt,
                                file: {
                                    url: attribs.src,
                                    details: {
                                        size: 46234, //@TODO - don't hardcode
                                        image: {
                                            width: parseInt(attribs.width, 10),
                                            height: parseInt(attribs.height, 10),
                                        },
                                    },
                                    fileName,
                                    contentType: 'image/' + R.last(R.split('.', fileName)),
                                },
                            },
                        },
                    },
                    content: [],
                    nodeType: htmlAttrs[type][name],
                };

            } else if (R.contains(name, ['i', 'b', 'u'])) {
                //console.log(elm);

                newData = R.assoc('marks', R.append({ type: htmlAttrs[type][name] }, content[0].marks), content[0]);
            } else if (name === 'a') {
                /*
                newData = [{
                    data: {},
                    marks: [],
                    value: '',
                    nodeType: 'text',
                }, {
                    data: { uri: attribs.href },
                    content,
                    nodeType: htmlAttrs[type][name],
                }, {
                    data: {},
                    marks: [],
                    value: '',
                    nodeType: 'text',
                }];
                /*/
                newData = {
                    data: { uri: attribs.href },
                    content,
                    nodeType: htmlAttrs[type][name],
                };
                //*/
            } else {
                //They want to make sure there is always a text element inside paragraphs
                if (name === 'p' && !content.length) {
                    content = [{
                        data: {},
                        marks: [],
                        value: '',
                        nodeType: 'text',
                    }];
                }

                newData = {
                    data: {},
                    content,
                    nodeType: htmlAttrs[type][name],
                };
            }
        } else {
            console.log('***new type needed -', type, data);
        }
        results = R.type(newData) === 'Array' ? R.concat(results, newData) : R.append(newData, results);
    }, dom);
    return results;
};

const handleFn = (error, dom) => {
    if (error) {
        throw error;
    }
    transformed = {
        data: {},
        content: transformDom(dom),
        nodeType: 'document',
    };
};

const parser = new htmlParser.Parser(new htmlParser.DefaultHandler(handleFn));

const parseHtml = (html) => {
    parser.parseComplete(html); //returns undefined...
    return transformed;
};

module.exports = {
    parseHtml,
};
