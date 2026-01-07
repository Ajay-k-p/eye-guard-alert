# MediaPipe Vercel Fixes

## Changes Made
- [x] Removed MediaPipe Camera class import and dependency
- [x] Replaced MediaPipe Camera with native getUserMedia API
- [x] Updated camera initialization to use navigator.mediaDevices.getUserMedia
- [x] Implemented manual frame processing loop using requestAnimationFrame
- [x] Updated cleanup logic to properly stop camera tracks
- [x] Removed @mediapipe/camera_utils from package.json
- [x] Fixed FaceMesh to use CDN paths with locateFile for Vercel compatibility
- [x] Created vercel.json with camera permissions policy
- [x] Ensured user gesture before camera start (button click in CameraView)

## Testing Required
- [x] Test camera access locally
- [ ] Deploy to Vercel and test camera access
- [ ] Verify face detection still works properly
- [x] Check for any console errors

## Notes
- The native getUserMedia API should work better on Vercel than MediaPipe's Camera class
- HTTPS requirement for camera access is satisfied by Vercel's deployment
- Frame processing is now handled manually instead of through MediaPipe's Camera onFrame callback
- FaceMesh now uses CDN paths to avoid local file loading issues on Vercel
