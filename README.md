# contentful-html-rich-text-converter
This package was built to support migration of rich text into contentful

**This package is currently still under development and in beta**

## Installation

Using npm:

`npm install contentful-html-rich-text-converter`

## Use

```
const { parseHtml } = require('contentful-html-rich-text-converter');

const html = '<ul><li><p>a</p></li><li><p>b</p></li><li><p>c</p></li></ul><p></p>';
const result = parseHtml(html);
console.log(result);
```

Output:
```
  {
  "data": {},
  "content": [
    {
      "data": {},
      "content": [
        {
          "data": {},
          "content": [
            {
              "data": {},
              "marks": [],
              "value": "a",
              "nodeType": "text"
            }
          ],
          "nodeType": "paragraph"
        }
      ],
      "nodeType": "list-item"
    },
    {
      "data": {},
      "content": [
        {
          "data": {},
          "content": [
            {
              "data": {},
              "marks": [],
              "value": "b",
              "nodeType": "text"
            }
          ],
          "nodeType": "paragraph"
        }
      ],
      "nodeType": "list-item"
    },
    {
      "data": {},
      "content": [
        {
          "data": {},
          "content": [
            {
              "data": {},
              "marks": [],
              "value": "c",
              "nodeType": "text"
            }
          ],
          "nodeType": "paragraph"
        }
      ],
      "nodeType": "list-item"
    }
  ],
  "nodeType": "unordered-list"
}
```

## Current Status

### Verified

* `<ul>`
* `<ol>`
* `<li>`
* `<b>`
* `<u>`
* `<i>`
* `<p>`
* `<hr>`
* `<blockquote>`
* `<p>`
* `<h{1-6}>`
* `<a>`
* `<code>`
* `<br />`
* `<table>`

### In development
* `<img>`

##Git Repository

https://github.com/sethimcclaine/contentful-html-rich-text-converter
