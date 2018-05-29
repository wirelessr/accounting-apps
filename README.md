# accounting-apps

## 動機

我一直想學javascript，主要動機是想切入產品設計，因為後端具備後要將商品呈現，勢必得要有前端參與。Javascript絕對是當紅炸子雞，所以為了徹底學習javascript，我架了一個站，前端使用pure HTML/CSS/javascript，沒有套用任何框架，後端使用Node.js搭配Express。

## 心得

這次有個很重要的心得，想要學習javascript，使用Node.js切入實在是個bad idea。主要是Node.js雖然是個純javascript的框架，但是他有把I/O這件事asynchronous，這導致很多code寫起來很lousy。必須要層層疊疊一堆callback function，邏輯也很複雜。結果是花了很多心力在處理callback和async，反倒javascript的語法沒多深入。現在的主流趨勢是micro-service，會將許多功能分拆成小的service，然後透過restful API去CRUD，這勢必會有很多網路I/O，而背後的邏輯卻又asynchronous，不直覺也不方便。

## 後話

使用這個repo，可以讓一個沒有Node.js經驗的人快速把一個站給build起來，使用者登入管理/資料庫/前端呈現等基本功能應有盡有，但不甚完全，例如沒有考慮到CSRF的安全性，使用者的session也沒有使用JWT包含更多內容。有一些future works有待實現：

1. CSRF/session token/JWT
2. Unit test -&gt; test restful
3. CI -&gt; Travis CI
4. D3太底層，可以用C3精簡圖表的code
5. 多方驗證，例如：email或者社群網站




[開發筆記](https://wirelessr.gitbooks.io/-saas/content/nodejs-buildup.html)
