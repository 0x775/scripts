function print_debug(data){
        // 格式化对象为可读字符串
            let info;
            try {
                info = JSON.stringify(data, null, 2);
            } catch (e) {
                // 如果包含循环引用等无法序列化的结构
                info = '（无法序列化：' + e.message + '）\n\n原始类型：' + typeof data + '\n值：' + String(data);
            }

            // 使用 textarea 创建可滚动、可复制的弹窗
            const textarea = document.createElement('textarea');
            textarea.value = info;
            textarea.style.width = '90vw';
            textarea.style.height = '70vh';
            textarea.style.fontFamily = 'monospace';
            textarea.style.fontSize = '12px';
            textarea.style.padding = '10px';
            textarea.readOnly = true;

            const dialog = document.createElement('div');
            dialog.style.position = 'fixed';
            dialog.style.top = '50%';
            dialog.style.left = '50%';
            dialog.style.transform = 'translate(-50%, -50%)';
            dialog.style.zIndex = '90000';
            dialog.style.backgroundColor = 'white';
            dialog.style.border = '1px solid #ccc';
            dialog.style.borderRadius = '8px';
            dialog.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            dialog.style.maxWidth = '95vw';
            dialog.style.maxHeight = '85vh';
            dialog.style.overflow = 'hidden';

            const header = document.createElement('div');
            header.textContent = '详细内容';
            header.style.padding = '12px 16px';
            header.style.backgroundColor = '#f0f0f0';
            header.style.fontWeight = 'bold';
            header.style.borderBottom = '1px solid #ddd';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.color = '#888';
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });

            header.appendChild(closeBtn);
            dialog.appendChild(header);
            dialog.appendChild(textarea);

            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
            overlay.style.zIndex = '99999';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.appendChild(dialog);

            // 点击遮罩关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            });
            document.body.appendChild(overlay);
    }