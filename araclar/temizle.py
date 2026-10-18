import sys, cv2, numpy as np
from PIL import Image, ImageOps
src, dst = sys.argv[1], sys.argv[2]  # usage: temizle.py src.jpg dst.png [x0,y0,x1,y1]
img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
# Optional crop for small drawings on a big background: x0,y0,x1,y1 as fractions.
if len(sys.argv) > 3:
    c = [float(v) for v in sys.argv[3].split(",")]; IW, IH = img.size
    img = img.crop((int(c[0]*IW), int(c[1]*IH), int(c[2]*IW), int(c[3]*IH)))
a = np.array(img); H,W = a.shape[:2]
s = 800/max(H,W); sm = cv2.resize(a,(int(W*s),int(H*s)),interpolation=cv2.INTER_AREA)
h,w = sm.shape[:2]
bgr = cv2.cvtColor(sm, cv2.COLOR_RGB2BGR)
# init: dark outline + saturated colors = sure fg; image border = sure bg
hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV); g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
mask = np.full((h,w), cv2.GC_PR_BGD, np.uint8)
ink = (g<90)|(hsv[...,1]>70)
ink = cv2.morphologyEx(ink.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3,3),np.uint8))
n,lab,st,_ = cv2.connectedComponentsWithStats(ink)
keep = np.zeros_like(ink)
for i in range(1,n):
    if st[i,cv2.CC_STAT_AREA]>150: keep[lab==i]=1
ys,xs = np.nonzero(keep); x0,x1,y0,y1 = xs.min(),xs.max(),ys.min(),ys.max()
mask[y0:y1, x0:x1] = cv2.GC_PR_FGD
mask[keep==1] = cv2.GC_FGD
m=8; mask[:m]=mask[-m:]=cv2.GC_BGD; mask[:,:m]=mask[:,-m:]=cv2.GC_BGD
bm,fm = np.zeros((1,65),np.float64),np.zeros((1,65),np.float64)
cv2.grabCut(bgr,mask,None,bm,fm,8,cv2.GC_INIT_WITH_MASK)
fg = np.isin(mask,[cv2.GC_FGD,cv2.GC_PR_FGD]).astype(np.uint8)
n,lab,st,_ = cv2.connectedComponentsWithStats(fg)
fg = (lab==1+np.argmax(st[1:,cv2.CC_STAT_AREA])).astype(np.uint8)
# fill holes
inv = 1-fg; n,lab = cv2.connectedComponents(inv)
border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))
fg[(inv==1)&~np.isin(lab,list(border))]=1
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5)))
alpha = cv2.resize(fg.astype(np.float32)*255,(W,H),interpolation=cv2.INTER_LINEAR)
alpha = cv2.GaussianBlur(alpha,(7,7),0)
x,y,bw,bh = cv2.boundingRect((alpha>127).astype(np.uint8)); p=12
X0,Y0,X1,Y1 = max(0,x-p),max(0,y-p),min(W,x+bw+p),min(H,y+bh+p)
f = np.clip((a.astype(np.float32)-25)*1.18,0,255)
out = Image.fromarray(np.dstack([f,alpha]).astype(np.uint8)[Y0:Y1,X0:X1],"RGBA")
out.thumbnail((600,600), Image.LANCZOS); out.save(dst)
bg = Image.new("RGBA", out.size,(120,190,120,255)); bg.alpha_composite(out)
bg.convert("RGB").save(dst.replace(".png","_onizleme.jpg")); print(out.size)
