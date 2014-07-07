
<h2>这个一个移动设备日期选择组件</h2>

<h4>组件基于jQuery和jQuery Touch</h4>

实例：
<pre>
	var appDateField = new APPDateField('date', {

	    isCN: true,       //是否显示中文, 如: " 2014年4月1日 "
	    commer: '/',      //期间之间的间隔符, 默认为 "/"，当 isCN为 true时, 这个设置失效
	    showYear: true,   //是否显示年份, 默认为显示 （true）
	    showMonth: true,  //是否显示月份, 默认为显示 （true）
	    showDate: true,   //是否显示日, 默认为显示 （true）
	    complate: function(evt){  // "完成"按钮触发事件
	        console.log(this)
	        console.log(this.getCurrentDate(0,0,0));
	        console.log(this.currDate);
	        //alert(999)
	    },
	    cancel: function(evt){  // "取消"按钮触发事件
	        console.log('Cancel---');
	    }
	    
	});
</pre>