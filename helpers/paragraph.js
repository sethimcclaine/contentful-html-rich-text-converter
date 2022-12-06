const R = require('ramda');

const paragraph = (subContent, nodeType) => {
    let subNodes = [];
    if (!subContent.length) {
        subNodes = [[{
            data: {},
            marks: [],
            value: '',
            nodeType: 'text',
        }]];
    } else {
        subNodes = [subContent];
        let brIndex = R.findIndex(R.propEq('nodeType', 'br'), R.last(subNodes));

        while(brIndex !== -1) {
            const last = subNodes.pop();

            const split = R.splitAt(brIndex, last);
            split[1].shift();//remove the br node
            subNodes = R.concat(subNodes, split);
            brIndex = R.findIndex(R.propEq('nodeType', 'br'), R.last(subNodes));
        }
    }
    newData = R.map((content) => ({
        data: {},
        content,
        nodeType: ["bold", "italic"].contains(nodeType) ? "text" : nodeType,
    }), subNodes);

    return newData;
};

module.exports = paragraph;
