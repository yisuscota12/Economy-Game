"""v1.0 — Distancia a la costa (agua) a media resolución → raw/coast.png (0 = tierra, 1..255 = mar, más lejos = mayor)."""
import numpy as np
from PIL import Image
from scipy import ndimage
im = np.asarray(Image.open('raw/id.png').convert('RGB')); land = (im[..., 0].astype(int) + im[..., 1].astype(int) * 256) > 0
d = ndimage.distance_transform_edt(~land)
v = np.where(land, 0, 1 + np.minimum(254, d * 5)).astype(np.float32)
h, w = v.shape; v = v[:h // 2 * 2, :w].reshape(h // 2, 2, w // 2, 2).mean((1, 3))
Image.fromarray(np.round(v).astype(np.uint8), 'L').save('raw/coast.png', optimize=True)
print(v.shape)
