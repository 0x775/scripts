#coding=utf-8
"""
python windows 后台截屏

待解决: 好像最小化无法截图
"""

import time
import cv2
import numpy as np
from ctypes import windll
import win32con
import win32api
import win32gui
import win32ui
import pygetwindow as gw
import pyautogui

#windll.user32.SetProcessDPIAware()

def get_window_hand(title):
	hand=None
	windows = gw.getAllWindows()
	for window in windows:
		print(window.title)
		if title in window.title:
			hand = window._hWnd
			break
	return hand

#截图1,不支持浏览器截图
def capture_window(hwnd,img):
    print("+++++",hwnd)
     # 获取句柄窗口位置
    left, top, right, bottom = win32gui.GetWindowRect(hwnd)
    width = right - left
    height = bottom - top
    print(left, top, right, bottom)
 
    # 获取窗口DC
    hwndDC = win32gui.GetWindowDC(hwnd)
    mfcDC = win32ui.CreateDCFromHandle(hwndDC)
    saveDC = mfcDC.CreateCompatibleDC()
    print(mfcDC,width,height)
 
    # 创建位图对象
    saveBitMap = win32ui.CreateBitmap()
    saveBitMap.CreateCompatibleBitmap(mfcDC, width, height)
 
    saveDC.SelectObject(saveBitMap)
 
    # 截取窗口内容
    saveDC.BitBlt((0, 0), (width, height), mfcDC, (0, 0), win32con.SRCCOPY)
 
    # 保存位图到内存中
    bmpinfo = saveBitMap.GetInfo()
    bmpstr = saveBitMap.GetBitmapBits(True)
    
    img = win32ui.CreateBitmapFromHandle(saveBitMap.GetHandle())
    win32gui.DeleteObject(saveBitMap.GetHandle())
    if bmpinfo['bmBitsPixel'] == 32:
        img.SaveBitmapFile(saveDC, "screenshot.bmp")
    else:
        img.SaveBitmapFile("screenshot.bmp")
 
    # 将位图数据转换为OpenCV格式
    image = np.frombuffer(bmpstr, dtype='uint8')
    image.shape = (height, width, 4)
 
    # 释放资源
    win32gui.DeleteObject(saveBitMap.GetHandle())
    saveDC.DeleteDC()
    mfcDC.DeleteDC()
    win32gui.ReleaseDC(hwnd, hwndDC)
 
 
    #文件保存
    # 转换为BGR格式
    bgr_image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
    cv2.imshow(bgr_image)
    cv2.waitkey(0)
 
    # 保存图像到文件
    cv2.imwrite(img, bgr_image)
 
    return cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
 
def capture(hwnd, x1, y1, x2, y2):
    w = x2 - x1
    h = y2 - y1
    hwnd_dc = win32gui.GetWindowDC(hwnd)
    mfc_dc = win32ui.CreateDCFromHandle(hwnd_dc)
    save_dc = mfc_dc.CreateCompatibleDC()
    bitmap = win32ui.CreateBitmap()
    bitmap.CreateCompatibleBitmap(mfc_dc, w, h)
    save_dc.SelectObject(bitmap)
    windll.user32.PrintWindow(hwnd, save_dc.GetSafeHdc(), 3)
    bmpinfo = bitmap.GetInfo()
    bmpstr = bitmap.GetBitmapBits(True)
    img = np.frombuffer(bmpstr, dtype=np.uint8).reshape((bmpinfo["bmHeight"], bmpinfo["bmWidth"], 4))
    win32gui.DeleteObject(bitmap.GetHandle())
    save_dc.DeleteDC()
    mfc_dc.DeleteDC()
    win32gui.ReleaseDC(hwnd, hwnd_dc)
    return img

if __name__ == '__main__':
    hwnd = get_window_hand("Chrome")
    print(hwnd)
    if hwnd:
        print("Find.移动窗口")
        win32gui.MoveWindow(hwnd, 0, 0,800,600,0)
        #a=capture_window(hwnd,"e:\\aaaa.jpg")
        st = time.time()
        img = capture(hwnd, 0, 0, 800, 600)
        print(f'耗时:{time.time() - st}')
        cv2.imshow("123", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        
        #window = gw.win32handle.Window(hwnd)
        x,y,width,height = win32gui.GetWindowRect(hwnd)
        print(x,y,width,height)
        screenshot = pyautogui.screenshot(region=(0,0,800,600))
        screenshot.save('screenshot.png')
        
    
