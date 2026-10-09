const { Router } = require("express");
const orbital = require("../controllers/orbital.controller");
const membership = require("../controllers/orbitalMemeber.controller");
const requests = require("../controllers/orbitalMemeber.controller");
const posts = require("../controllers/orbitalPosts.controller");
const { orbitalImageUpload, postMediaUpload } = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");
const {
    loadOrbital,
    requireAdmin,
    requireMember,
} = require("../middlewares/orbital.middleware");

const router = Router();

// Drive image proxy: <img> requests cannot attach the frontend Bearer token.
router.get("/image/:fileId", orbital.streamOrbitalImage);

router.use(protect);

router.post("/new", orbitalImageUpload, orbital.createOrbital);
router.get("/mine", orbital.getMyOrbitals); // must stay above "/:orbitalId"
router.get("/all", orbital.getAllOrbitals); // must stay above "/:orbitalId"

router.delete("/deleteorbital/:orbitalId", loadOrbital, requireAdmin, orbital.deleteOrbital);
// Everything below loads the orbital first
router.use("/:orbitalId", loadOrbital);
router.get("/:orbitalId", orbital.getOrbital);
router.patch("/:orbitalId", requireAdmin, orbital.updateOrbital);

// membership
router.post("/:orbitalId/join", membership.joinOrbital);
router.delete("/:orbitalId/join", membership.cancelJoinRequest);
router.delete("/:orbitalId/leave", requireMember, membership.leaveOrbital);
router.get("/:orbitalId/members", requireMember, membership.getMembers);
router.delete("/:orbitalId/members/:userId", requireAdmin, membership.removeMember);

// join requests (admin)
router.get("/:orbitalId/requests", requireAdmin, requests.getJoinRequests);
router.patch("/:orbitalId/requests/:userId/approve", requireAdmin, requests.approveJoinRequest);
router.delete("/:orbitalId/requests/:userId", requireAdmin, requests.rejectJoinRequest);

// posts (members only)
router.post("/:orbitalId/posts", requireMember, postMediaUpload, posts.createOrbitalPost);
router.get("/:orbitalId/posts", requireMember, posts.getOrbitalPosts);
router.delete("/:orbitalId/posts/:postId", requireMember, posts.deleteOrbitalPost);

module.exports = router;