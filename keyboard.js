'use strict';

function KeyBoard(e_div_kb, parent_Ntfyd) {
  const g = {
    Px_Mgn: 5,  // px指定
    Px_Shrink_NumKey: 8,  // px指定
  }
    
  const _ary_e_btns = [];
  
  let _kb_Wd_cur = e_div_kb.clientWidth;
  const kb_Ht = e_div_kb.clientHeight;
  
  let _kb_top = document.body.clientHeight - kb_Ht;
  e_div_kb.style.top = _kb_top + "px";
  
  const btn_frm_Wd = (_kb_Wd_cur - g.Px_Mgn) / 10;
  const btn_frm_Ht = (kb_Ht + g.Px_Shrink_NumKey - g.Px_Mgn) / 4;
  
  const str_btn_Wd = btn_frm_Wd - g.Px_Mgn + "px";
  const str_btn_Ht = btn_frm_Ht - g.Px_Mgn + "px";
  const str_NumKey_btn_Ht = btn_frm_Ht - g.Px_Shrink_NumKey - g.Px_Mgn + "px";
  const str_font_size = btn_frm_Ht / 2 - g.Px_Mgn + "px";
    
  const ary_key_chrs = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
  ];
  
  let left_start_pos = g.Px_Mgn;
  let top_pos = g.Px_Mgn;
  
  // 数字キーの生成
  Crt_Keys(left_start_pos, top_pos + "px", str_NumKey_btn_Ht, "1234567890");
  top_pos += btn_frm_Ht - g.Px_Shrink_NumKey;
  
  for (const key_chrs of ary_key_chrs) {
    Crt_Keys(left_start_pos, top_pos + "px", str_btn_Ht, key_chrs);
    
    left_start_pos += btn_frm_Wd / 2 - 1;
    top_pos += btn_frm_Ht;
  }
  
  const e_btn_hide = Crt_e_btn(
    _kb_Wd_cur - btn_frm_Wd - g.Px_Mgn, top_pos - btn_frm_Ht + "px"
    , btn_frm_Wd + "px", str_btn_Ht, "✕");
  e_btn_hide.style.color = "#f00";
  e_btn_hide.onclick = () => { parent_Ntfyd.NtfyHideKeyboard(); }

  function Crt_Keys(left, str_top, str_Ht, key_chrs) {
    for (let i = 0; i < key_chrs.length; i++) {
      const e_btn = Crt_e_btn(left, str_top, str_btn_Wd, str_Ht, key_chrs[i]);
      _ary_e_btns.push(e_btn);
      
      const charcode = key_chrs.charCodeAt(i);
      e_btn.onclick = () => { parent_Ntfyd.NtfyCharCode(charcode); }
      
      left += btn_frm_Wd;
    }
  }
  
  function Crt_e_btn(left, str_top, str_btn_Wd, str_Ht, str_chr) {
    const e_btn = document.createElement('div');
    e_btn.classList.add('kb_btn');
    e_btn.style.left = left + 'px';
    e_btn.style.top = str_top;
    e_btn.style.width = str_btn_Wd;
    e_btn.style.height = str_Ht;
    e_btn.style.lineHeight = str_Ht;
    e_btn.style.fontSize = str_font_size;
    e_btn.textContent = str_chr;
    
    e_div_kb.appendChild(e_btn);
    return e_btn;
  }
  
  this.NtfyResize = () => {
    const kb_Ht_prov = document.body.clientHeight - kb_Ht;
    if (kb_Ht_prov != _kb_top) {
      _kb_top = kb_Ht_prov;
      e_div_kb.style.top = _kb_top + "px";
    }
    
    const Wd = document.body.clientWidth;
    if (Math.abs(Wd - _kb_Wd_cur) <= 10) { return; }
    
    _kb_Wd_cur = Wd;
    const btn_frm_Wd = (_kb_Wd_cur - g.Px_Mgn) / 10;
    const str_btn_Wd = btn_frm_Wd - g.Px_Mgn + "px";
    let left_start_pos = g.Px_Mgn;
    
    Resize_e_btns(0, 10, left_start_pos, btn_frm_Wd, str_btn_Wd);
    
    let idx = 10;
    for (const key_chrs of ary_key_chrs) {
      Resize_e_btns(idx, key_chrs.length, left_start_pos, btn_frm_Wd, str_btn_Wd);
      
      idx += key_chrs.length;
      left_start_pos += btn_frm_Wd / 2 - 1;
    }
    
    e_btn_hide.style.left = _kb_Wd_cur - btn_frm_Wd - g.Px_Mgn + "px";
    e_btn_hide.style.width = btn_frm_Wd + "px";
  }
  
  function Resize_e_btns(idx, pcs, left, btn_frm_Wd, str_btn_Wd) {
    for ( ; pcs > 0; pcs--) {
      const e_btn = _ary_e_btns[idx++];

      e_btn.style.left = left + "px";
      e_btn.style.width = str_btn_Wd;
      
      left += btn_frm_Wd;
    }
  }
}

