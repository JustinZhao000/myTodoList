;(function(){
  'use strict';
  var $form_add_task=$('.add-task'),
      $body=$('body'),
      $window=$(window),
      task_list=[],
      $task_list=$('.task-list'),
      $task_detail_button,
      $task_detail=$('.task-detail'),
      $task_list_mask=$('.task-detail-mask'),
      $delete_task,
      current_index,
      $update_form,
      $task_detail_content,
      $task_detail_content_input,
      $checkbox_complete,
      $msg=$('.msg'),
      $msg_content=$msg.find('.msg-content'),
      $msg_confirm=$msg.find('button'),
      $alerter=$('.alerter'),
      $title,
      $confirm,
      $cancel;

   init(); 
   // pop('确定要删除吗？').then(function(r){
   //     if(r){

   //     }else{

   //     }
   // });
   
  function pop(arg){

    if(!arg){
      console.log("1");
    }
    var conf={},$box,$mask,$title,$content,dfd,confirmed,timer;
    dfd=$.Deferred();

    if(typeof arg=='string')
      conf.title=arg;
    else{
      conf=$.extend(conf,arg);
    }
    
     $box=$('<div>'+
       '<div class="pop-title">'+conf.title+'</div>'+
       '<div class="pop-content"><button class="primary confirm">确定</button><button class="primary cancel">取消</button></div>'+
      '</div>').css({
      width:300,
      height:100,
      background:'#fff',
      position:'fixed',
      'border-radius':5,
      'box-shadow':'2px 2px 3px'
    });
     $content=$box.find('.pop-content').css({
      padding:'5px 10px',
      'color':'#000',
      'text-align':'center'
    });

    $confirm=$content.find('button.confirm');
    $cancel=$content.find('button.cancel');
    
    timer=setInterval(function(){
      if(confirmed!==undefined){
          dfd.resolve(confirmed);
          clearInterval(timer);
          dismiss_pop();
      }
    },50); 

    $confirm.on('click',function(){
      confirmed=true;
    });

    $cancel.on('click',function(){
      confirmed=false;
    });

   
    $mask=$('<div></div>').css({
       position:'fixed',
       top:0,
       bottom:0,
       left:0,
       right:0,
       background:'rgba(0,0,0,.3)'
    });
   
     $mask.on('click',function(){
      confirmed=false;
    });
    $title=$box.find('.pop-title').css({
       padding:'5px 10px',
       'font-weight':900,
       'color':'#000',
       'font-size':18,
       'text-align':'center'
    });
    
    function dismiss_pop(){
      $mask.remove();
      $box.remove();
    }
   
    function adjust_box_position(){    
     var window_width=$window.width(),
         window_height=$window.height(),
         box_width=$box.width(),
         box_height=$box.height(),
         move_x,
         move_y,
         move_x=(window_width-box_width)/2,
         move_y=(window_height-box_height)/2-50;
        $box.css({
           top:move_y,
           left:move_x
        });
  }
     adjust_box_position();
   $window.on('resize',function(){
     adjust_box_position();
   });
    
    $mask.appendTo($body);
    $box.appendTo($body);
    adjust_box_position();
    return dfd.promise();
  }

  
  
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
      task_remind_check();
    }

  }

  function listen_task_event(){
    $msg_confirm.on('click',function(){
      hide_msg();
    });
  }
   
   function task_remind_check(){
    var current_timestamp;
    var itl=setInterval(function(){
      for(var i=0;i<task_list.length;i++){
      var item=get(i),task_timestamp;
      if(!item||!item.remind_date||item.informed)
        continue;
      
      current_timestamp=(new Date()).getTime();
      task_timestamp=(new Date(item.remind_date)).getTime();
      
      if(current_timestamp-task_timestamp>=1){
        update_task(i,{informed:true});
        show_msg(item.content);  
        listen_task_event();
      }   
    }
  },300);
    
   }

   function show_msg(msg){
      $msg.show();
      $msg_content.html(msg).show();
      $alerter.get(0).play();
   }

   function hide_msg(){
    $msg.hide();
   }
  // 渲染list列表
  function render_task_list(){
    var $task_list=$(".task-list");
    $task_list.html('');
    var complete_items=[];
    for(var i=0;i<task_list.length;i++){
      var item=task_list[i];
      if(item&&item.complete){
        complete_items.push(item);
      }
      else{
        var $task=render_task_item(task_list[i],i);
        $task_list.append($task);
      }
  }
    for(var j=0;j<complete_items.length;j++){
      if(!item) continue;
        $task=render_task_item(complete_items[j],j);
        $task.addClass('completed');
        $task_list.append($task);
    }
    $delete_task=$('.delete');
    $task_detail_button=$('.detail');
    $checkbox_complete=$('.task-list .complete');
    listen_task_delete();
    listen_task_detail();
    listen_checkbox_complete();
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
      pop('确定删除?').then(function(r){
          r?delete_task(index):null;
      }); 
  });
  }
// 监听事件详情
  function listen_task_detail(){
    var index;
    $('.task-item').on('dblclick',function(){
         index=$(this).data('index');
         console.log(index);
         show_task_detail(index);
    });

     $task_detail_button.on('click',function(){
         var $this=$(this);
         var $item=$this.parent();
         index=$item.data('index');
         show_task_detail(index);
     });
}
    // 监听完成任务事件
     function listen_checkbox_complete(){
       $checkbox_complete.on('click',function(){
         
          var $this=$(this);
          // var is_complete=$(this).is(':checked');
          var index=$this.parent().parent().data('index');
          console.log(index);
          var item=get(index);
          console.log(item);
          if(item.complete){
            update_task(index,{complete:false});
            $this.prop('checked',true);
          }else{
            update_task(index,{complete:true});
            $this.prop('checked',false);
          }
          
       });
     }
   function get(index){
    return store.get('task_list')[index];
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
    if(index===undefined||!task_list[index]) return;
    task_list[index]=$.extend({},task_list[index],data);
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
       '<span>提醒时间</span>'+
      '<input type="text" class="datetime" name="remind" value="'+(item.remind_date||'')+'">'+
      '<button type="submit">Update</button>'+
    '</div>'+
    '</form>';
    $task_detail.html('');
    $task_detail.html(tpl);
    $('.datetime').datetimepicker();
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
   var list_item_tpl='<div class="task-item" data-index="'+index+'">'+'<span><input type="checkbox"'+(data.complete?'checked':'')+' class="complete"> </span>'+
                     '<span class="task-content">'+data.content+'</span>'+'<span class="action fr delete"> Delete</span>'+'<span class="action fr detail"> Detail</span>'+'</div>';
    return $(list_item_tpl);  
  }
})();