;(function(){
  'use strict';
  var $form_add_task=$('.add-task'),
      task_list=[],
      $delete_task;

  // 点击添加事件    
  $form_add_task.on('submit',function(e){
    var new_task={};
  	e.preventDefault();
    var $input=$(this).find('input[name=content]');
  	new_task.content=$input.val();
  	
  	if(!new_task.content) return;
    // var result=add_task(new_task);
    if(add_task(new_task)){
      render_task_list();
      $input.val('');
    }
  });
  
  init();
  // 添加任务
  function add_task(new_task){
    task_list.push(new_task);
    store.set('task_list',task_list);
    return true;
  }
  
  // 删除语句
  function delete_task(index){   
    if(!index||!task_list[index]) return;
  
    delete task_list[index];
    refresh_task_list();
  }
  // 刷新localStorage的数据，并渲染模版
  function refresh_task_list(){
    store.set('task_list',task_list);
    render_task_list();
  }
  
  // 初始化语句，从localstorage拿到数据，然后渲染
  function init(){
    task_list=store.get('task_list')||[];
    if(task_list.length){
      render_task_list();
    }

  }

  // 渲染画面
  function render_task_list(){
    var $task_list=$(".task-list");
    $task_list.html('');
    for(var i=0;i<task_list.length;i++){
        var $task=render_task_item(task_list[i],i);
        $task_list.append($task);
  }
    $delete_task=$('.delete');
   listen_task_delete();
  }
  
  // 监听删除按钮的点击事件
  function listen_task_delete(){
     $delete_task.on('click',function(){
      var $this=$(this);
      var $item=$this.parent();
       var index=$item.data('index');
       //举个例子, 给定下面的HTML:
// <div data-role="page" data-last-value="43" data-hidden="true" data-options='{"name":"John"}'></div>
// 下面所有的 jQuery 代码都能运行。
// $("div").data("role") === "page";
// $("div").data("lastValue") === 43;
// $("div").data("hidden") === true;
// $("div").data("options").name === "John";
     var temp=confirm('确定删除?');
      
      temp?delete_task(index):null;

  });
  }
  
  // 渲染的語句
  function render_task_item(data,index){
    if(!data||!index) return;
   var list_item_tpl='<div class="task-item" data-index="'+index+'">'+'<span><input type="checkbox"> </span>'+
                     '<span class="task-content">'+data.content+'</span>'+'<span class="action fr delete"> Delete</span>'+'<span class="action fr"> Detail</span>'+'</div>';
    return $(list_item_tpl);   
  }
})();