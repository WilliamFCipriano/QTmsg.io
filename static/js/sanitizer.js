var tags = {
    '<font': ['</font>'],
    '<a href': ['</a>'],
    '<b': ['</b>'],
    '<abbr': ['</abbr>'],
    '<bdi': ['</bdi>'],
    '<big': ['</big>'],
    '<blockquote': ['</blockquote>'],
    '<center': ['</center>'],
    '<cite': ['</cite>'],
    '<code': ['</code>'],
    '<del': ['</del>'],
    '<dfn': ['</dfn>'],
    '<em': ['</em>'],
    '<i': ['</i>'],
    '<ins': ['</ins>'],
    '<kbd': ['</kdb>'],
    '<mark': ['</mark>'],
    '<meter': ['</meter>'],
    '<pre': ['</pre>'],
    '<progress': ['</progress>'],
    '<q': ['</q>'],
    '<rp': ['</rp>'],
    '<rt': ['</rt>'],
    '<ruby': ['</ruby>'],
    '<s': ['</s>'],
    '<samp': ['</samp>'],
    '<small': ['</small>'],
    '<strike': ['</strike>'],
    '<strong': ['</strong>'],
    '<sub': ['</sub>'],
    '<sup': ['</sup>'],
    '<time': ['</time>'],
    '<tt': ['</tt>'],
    '<u': ['</u>'],
    '<var': ['</var>'],
    '<wbr': ['</wbr>'],
    '<img': ['</img>'],
    '<map': ['</map>'],
    '<area': ['</area>'],
    '<canvas': ['</canvas>'],
    '<figure': ['</figure>'],
    '<figcaption': ['</figcaption>'],
    '<ul': ['</ul>'],
    '<ol': ['</ol>'],
    '<li': ['</li>'],
    '<dir': ['</dir>'],
    '<dl': ['</dl>'],
    '<dt': ['</dt>'],
    '<dd': ['</dd>'],
    '<menu': ['</menu>'],
    '<menuitem': ['</menuitem>'],
    '<table': ['</table>']
};


function sanitize(string) {

    /** remove script and div tags **/
    message = string.replace(/<.*?script.*?>/igm, '&lt;script&gt;');
    message = message.replace(/<.*?div.*?>/igm, '&lt;div&gt;');
    message = message.replace(/<.*?link.*?>/igm, '&lt;link&gt;');
    message = message.replace(/<.*?embed.*?>/igm, '&lt;embed&gt;');
    message = message.replace(/<.*?param.*?>/igm, '&lt;param&gt;');
    message = message.replace(/<.*?img.*?>/igm, '&lt;img&gt;');


    lowercaseMessage = message.toLowerCase();


    for (var opentag in tags) {

            if (lowercaseMessage.indexOf(opentag) >= 0) {

                    message += tags[opentag];
                }
            }

            return message;
}