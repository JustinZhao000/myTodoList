;(function(){
  'use strict';
  var $form_add_task=$('.add-task'),
      task_list=[],
      $task_list=$('.task-list'),
      $task_detail_button,
      $task_detail=$('.task-detail'),
      $task_list_mask=$('.task-detail-mask'),
      $delete_task,
      current_index,
      $update_form,
      $task_detail_content,
      $task_detail_content_input;
   init(); 
  // 点击submit添加事件    
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
  
  
  $task_list_mask.on('click',function(){
         hide_task_detail();
         console.log("task");
     });
  
  // 添加任务
  function add_task(new_task){
  
    task_list.unshift(new_task);
    store.set('task_list',task_list);
    return true;
  }
  
  // 删除语句
  function delete_task(index){   
    if(index===undefined||!task_list[index]) return;
  
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

  // 渲染list列表
  function render_task_list(){
    var $task_list=$(".task-list");
    $task_list.html('');
    for(var i=0;i<task_list.length;i++){
        var $task=render_task_item(task_list[i],i);
        $task_list.append($task);
  }
    $delete_task=$('.delete');
    $task_detail_button=$('.detail');
    listen_task_delete();
    listen_task_detail();
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
// 监听事件详情
  function listen_task_detail(){
     $task_detail_button.on('click',function(){
         var $this=$(this);
         var $item=$this.parent();
         var index=$item.data('index');
         show_task_detail(index);
     });

     
  }
  // 查看task详情
  function show_task_detail(index){
    render_task_detail(index);
    current_index=index;
    $task_detail.show();
    $task_list_mask.show();
    
  }
  // 更新task
  function update_task(index,data){
    if(!index||!task_list[index]) return;
    task_list[index]=data;//$.merge({},task_list[index],data)
    refresh_task_list();
  }
  
  // $('.task-list').on('click',function(){
  //     console.log("click");
      
  //     show_task_detail(current_index);

  // });
  // 隐藏task详情
  function hide_task_detail(){
    $task_detail.hide();
    $task_list_mask.hide();
  }

   // 渲染task_detail
  function render_task_detail(index){
    if(index===undefined||!task_list[index]) return;
    var item=task_list[index];
    for(var k in item){
      if(item.desc===undefined){
        item.desc='';
      }
    }
    var tpl='<form>'+
    '<div class="content">'+item.content+
    '</div>'+
    '<div>'+
    '<input type="text" style="display:none;" name="content" value="'+
     item.content+'">'+
     '</div>'+
    '<div>'+
    '<div class="desc">'+ 
      '<textarea name="desc">'+item.desc+'</textarea>'+   
    '</div>'+
    '</div>'+
    '<div class="remind">'+
      '<input type="date" name="remind" value="'+item.remind_date+'">'+
      '<button type="submit">Update</button>'+
    '</div>'+
    '</form>';
    $task_detail.html('');
    $task_detail.html(tpl);
    $update_form=$task_detail.find('form');
    $task_detail_content=$update_form.find('.content');
    $task_detail_content_input=$update_form.find('[name=content]');

    $task_detail_content.on('dblclick',function(){
       $task_detail_content_input.show();
       $task_detail_content.hide();
    });
    // 点击更新
    $update_form.on('submit',function(e){
       e.preventDefault();
       var data={};
       data.content=$(this).find('[name=content]').val();
       
       data.desc=$(this).find('[name=desc]').val();
       data.remind_date=$(this).find('[name=remind]').val();

       update_task(index,data);
       hide_task_detail();
    });
    
 }
  // 渲染的task語句
  function render_task_item(data,index){
    if(!data||index===undefined) return;
   var list_item_tpl='<div class="task-item" data-index="'+index+'">'+'<span><input type="checkbox"> </span>'+
                     '<span class="task-content">'+data.content+'</span>'+'<span class="action fr delete"> Delete</span>'+'<span class="action fr detail"> Detail</span>'+'</div>';
    return $(list_item_tpl);  
  }
})();