//
// builds a tabbed page from json
// 
$(function() {new PageBuilder()});

class PageBuilder {
   constructor() {
      this.StashTemplates();
      this.MakeThePage();
   }

   StashTemplates() {
      this.templates = {};
      $("template").each((i, node) => {
         node = $(node);
         this.templates[node.attr("id")] = node.detach();
      });
   }

   async MakeThePage() {
      let pageName = this.UrlParam('page', 'page1') + ".json";
      let pageData = await (await fetch(pageName)).json();
      this.tabs = pageData.tabs;
      this.tabs.forEach((tab, i) => tab.idx = i+1);
      this.Build(this.tabs);
      $(document).trigger("page-done");
   }

   Build(tabs) {
      let container = $('body');
      tabs.forEach(tab => {
         let snippet = this.Template('tab', tab);
         container.append(snippet);
         container = snippet;
      });
      container.append(this.BuildMenu(tabs));

      tabs.forEach(tab => {
         container.append(this.BuildPage(tab));
      })
   }

   BuildMenu(tabs){
      let snippet = this.Template('menu', tabs);
      tabs.forEach(tab => snippet.append(this.Template('menu-item', tab)));
      return snippet;
   }

   BuildPage(tab){
      let snippet = this.Template('page', tab);
      let section = snippet.find('section');
      tab.blocks.forEach(block => section.append(this.BuildBlock(block)));
      return snippet;
   }

   BuildBlock(block){
      let snippet = this.Template('block', block);
      let hint = snippet.find('.hint');
      if (block.list) hint.append(this.BuildList(block.list));
      if (block.linklist) this.BuildLinkList(hint, block.linklist);
      return snippet;
   }

   BuildList(list){
      let snippet = this.Template('list');
      list.forEach(item => snippet.append(this.Template('item', item)));
      return snippet;
   }

   BuildLinkList(snippet, list){
      list.forEach(item => snippet.append(this.Template('linkitem', item)));
      return snippet;
   }

   Template(name, data) {
      let html = this.templates[name].html();
      html = html.replace(/{.+?}/g, (m) => {
         return data[m.match(/{(.+)}/)[1]] || ""
      });
      return $(html);
   }

   UrlParam(name, defaultVal){
      let results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
      if(results){
         return decodeURIComponent(results[1]);
      }
      return defaultVal;
   }
}
