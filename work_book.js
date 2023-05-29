'use strict';

Element.prototype.Add_Div = function() {
  const e_div = document.createElement('div');
  this.appendChild(e_div);
  return e_div;
}

// ------------------------------------------------
function WorkBook(ary_txt, e_div_workBook) {

  const g = {
    COLOR_Model_NoType: "#888",
    COLOR_Model_Typed: "#000",
    
    PCS_Chr_to_Input: 1,  // デフォルト値は１
    MSec_Clear_Miss_Chr: 1000,
    Px_Border_Focused: "0 0 0 3px #f008",
  }

  const _ary_work_blk = [];
  const _ary_b_completed = [];
  for (let idx = 0; idx < ary_txt.length; idx++) {
    _ary_work_blk.push(new WorkBlk(idx, ary_txt[idx], this));
    _ary_b_completed.push(false);
  }
    
  this.ReqFocus = (item) => { ChangeFocus(item); }
  
  this.NtfyCompleted = (idx) => {
    _ary_b_completed[idx] = true;
    ChangeFocus(SrchNextItem(idx));
  }
  
  this.NtfyReset = (idx) => {
    _ary_b_completed[idx] = false;
    ChangeFocus(_ary_work_blk[idx]);
  }
  
  function SrchNextItem(idx) {
    for (let i = idx + 1; i < _ary_work_blk.length; i++) {
      if (_ary_b_completed[i] == false) {
        return _ary_work_blk[i];
      }
    }
    
    for (let i = 0; i < idx; i++) {
      if (_ary_b_completed[i] == false) {
        return _ary_work_blk[i];
      }
    }
    
    return null;
  }
  
  const ChangeFocus = ((init_item) => {
    let _cur_focused = init_item;
    _cur_focused.SetFocus();
    document.onkeydown = _cur_focused.OnKeyDown;
    
    return (item) => {
      if (item == _cur_focused) { return; }
      if (_cur_focused != null) {
        _cur_focused.RemoveFocus();
      }
      
      _cur_focused = item;
      if (_cur_focused == null) {
        document.onkeydown = null 
      } else {        
        _cur_focused.SetFocus();
        document.onkeydown = _cur_focused.OnKeyDown;
      }
    }
  })(_ary_work_blk[0]);
  
  this.NtfyResize = () => {
    for (let work_blk of _ary_work_blk) {
      work_blk.NtfyResize();
    }
  }
  
  // ------------------------------------------------
  function WorkBlk(idx, txt, parent) {
    const ary_words = txt.split(" ");
    const _modelFld = new ModelFld(ary_words);
    const _inputFld = new InputFld(ary_words, _modelFld, this);
    
    const e_div_clear = e_div_workBook.Add_Div();
    e_div_clear.classList.add('div_for_btn');
    const e_btn_clear = document.createElement('button');
    e_btn_clear.textContent = "Reset";
    e_div_clear.appendChild(e_btn_clear);
    
    this.OnKeyDown = (e) => { _inputFld.OnKeyDown(e); }
    this.SetFocus = () => { _inputFld.SetFocus(); }
    this.RemoveFocus = () => { _inputFld.RemoveFocus(); }
    
    this.ReqFocus = () => {
      parent.ReqFocus(this);
    }
    
    this.NtfyCompleted = () => {
      parent.NtfyCompleted(idx);
    }
    
    e_btn_clear.onclick = () => {
      _modelFld.Reset();
      _inputFld.Reset();
      parent.NtfyReset(idx);
      
      e_btn_clear.blur();
    }
    
    this.DBG_GetIdx = () => idx;
    
    this.NtfyResize = () => {
      _inputFld.NtfyResize();
    }
  }


  // ------------------------------------------------
  function ModelFld(ary_words) {
    const _e_modelFld = e_div_workBook.Add_Div();
    _e_modelFld.classList.add('glass');
    
    const _ary_span = [];
    for (let idx = 0; idx < ary_words.length; idx++) {
      const span = document.createElement('span');
      span.textContent = ary_words[idx] + "\u00a0";
      span.style.color = g.COLOR_Model_NoType;
      _ary_span.push(span);
      _e_modelFld.appendChild(span);
    }
    
    let _idx_cur_word = 0;
    this.AdvanceCurWord = () => {
      _ary_span[_idx_cur_word++].style.color = g.COLOR_Model_Typed;
    }
    
    this.GetHeight = () => _e_modelFld.clientHeight + 2;
    
    this.Reset = () => {
      for (let i = 0; i < _idx_cur_word; i++) {
        _ary_span[i].style.color = g.COLOR_Model_NoType;
      }
      _idx_cur_word = 0;
    }
  }


  // ------------------------------------------------
  function InputFld(ary_words, modelFld, workBlk) {
    // html 要素 ------------------
    const _e_inputFld = e_div_workBook.Add_Div();
    _e_inputFld.classList.add('glass');
    _e_inputFld.classList.add('incomplete_fld');
        
    _e_inputFld.style.height = modelFld.GetHeight() + "px";
    this.Get_e_fld = () => _e_inputFld;
    
    const _ary_span = [];
    for (let i = ary_words.length; i > 0; i--) {
      const span = document.createElement('span');
      _e_inputFld.appendChild(span);
      _ary_span.push(span);
    }
    
    const _curWordOp = new CurWordOp(this);
    
    // メンバ変数 ------------------
    let _idx_cur_word = 0;
    const _idx_end_word = ary_words.length - 1;
    let _b_completed = false;
    
    // ------------------
    _curWordOp.Set_NewWord(ary_words[0]);
    
    this.AdvanceCurWord = () => {
      modelFld.AdvanceCurWord();
      _ary_span[_idx_cur_word].textContent = ary_words[_idx_cur_word] + "\u00a0";
      _idx_cur_word++;
      
      if (_idx_cur_word <= _idx_end_word) {
        _curWordOp.Set_NewWord(ary_words[_idx_cur_word]);
        return;
      }
      
      // 入力が完了した場合の処理
      _b_completed = true;
      _curWordOp.NtfyCompleted();
      
      _e_inputFld.classList.add('completed_fld');
      _e_inputFld.style.boxShadow = "";
      
      workBlk.NtfyCompleted();
    }
    
    this.OnKeyDown = (e) => { _curWordOp.OnKeyDown(e); }
    this.SetFocus = () => {
      if (_b_completed) { return; }
      _e_inputFld.style.boxShadow = g.Px_Border_Focused;
      _e_inputFld.focus();
    }
    this.RemoveFocus = () => {
      if (_b_completed) { return; }
      _e_inputFld.style.boxShadow = "";
    }
    
    _e_inputFld.onclick = () => {
      if (_b_completed) { return; }
      workBlk.ReqFocus();
    }
    
    this.Reset = () => {
      for (let i = 0; i < _idx_cur_word; i++) {
        _ary_span[i].textContent = "";
      }
      _idx_cur_word = 0;
      _b_completed = false;
      
      _curWordOp.Reset();
      _curWordOp.Set_NewWord(ary_words[0]);
      _e_inputFld.classList.remove('completed_fld');
    }
    
    this.NtfyResize = () => {
      _e_inputFld.style.height = modelFld.GetHeight() + "px";
    } 
  }


  // ------------------------------------------------
  function CurWordOp(parent_inputFldOp) {
    // html 要素 ------------------
    const _e_typing = document.createElement('span');
    parent_inputFldOp.Get_e_fld().appendChild(_e_typing);
    const _missChrOp = new MissChrOp(parent_inputFldOp);
    
    // メンバ変数 ------------------
    let _word_typed, _word_remain;
    let _chrcode_to_type;
    let _b_completed = false;

    // ------------------
    this.Set_NewWord = (new_word) => {
      _word_typed = "";
      _e_typing.textContent = "";
      
      _word_remain = new_word.slice(0, g.PCS_Chr_to_Input);
      _chrcode_to_type = _word_remain.charCodeAt(0);
          
      if (_chrcode_to_type > 96) { _chrcode_to_type -= 32; }
    }
    
    this.NtfyCompleted = () => {
      _e_typing.textContent = "";
      _b_completed = true;
    }

    this.OnKeyDown = (e) => {
      if (_b_completed) { return; }
      if (e.key.length > 1) { return; }
      
      let chrcode = e.key.charCodeAt(0);
      if (chrcode <= 32 || chrcode >= 127) { return; }
      if (chrcode > 96) { chrcode -= 32; }
      if (chrcode != _chrcode_to_type) {
        _missChrOp.SetChr(e.key);
        return;
      }
      _missChrOp.ClearChr();
      
      _word_typed += e.key;
      _e_typing.textContent = _word_typed;
      
      if (_word_remain.length == 1) {
        // 次の単語へ進む処理
        parent_inputFldOp.AdvanceCurWord();
        return;
      }
      
      _word_remain = _word_remain.slice(1);
      _chrcode_to_type = _word_remain.charCodeAt(0);
      if (_chrcode_to_type > 96) { _chrcode_to_type -= 32; }
    }
    
    this.Reset = () => {
      _b_completed = false;
      _missChrOp.ClearChr();
    }
  }


  // ------------------------------------------------
  function MissChrOp(parent_inputFldOp) {
    const _e_misschr = parent_inputFldOp.Get_e_fld().Add_Div();
    _e_misschr.style.color = "#d00";
    
    let _timeoutID_cur = -1;
    
    this.SetChr = (str) => {
      if (_timeoutID_cur > 0) {
        clearTimeout(_timeoutID_cur);
      }
      _e_misschr.textContent = str;
      
      _timeoutID_cur = setTimeout(() => {
        _e_misschr.textContent = "";
        _timeoutID_cur = -1;
      }, g.MSec_Clear_Miss_Chr);
    };
    
    this.ClearChr = () => {
      if (_timeoutID_cur > 0) {
        clearTimeout(_timeoutID_cur);
        _timeoutID_cur = -1;
      }

      if (_e_misschr.textContent.length > 0) {
        _e_misschr.textContent = "";
      }
    };
  }

}
