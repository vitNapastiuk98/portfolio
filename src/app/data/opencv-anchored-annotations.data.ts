import type { EngineeringStudy } from '../models/study.models';

export const opencvAnchoredAnnotations: EngineeringStudy = {
  slug: 'opencv-anchored-annotations',
  title: 'Keeping AR annotations anchored in live video',
  category: 'Computer vision / OpenCV / Kurento',
  summary:
    'Keeping annotations attached to moving objects in a live video stream requires more than storing screen coordinates. This case study examines a tracking solution built with OpenCV and integrated into Kurento, using SIFT feature matching to preserve annotation positions as the camera or objects move.',
  experience: {
    contribution:
      'Designed and implemented the annotation-tracking functionality, from processing user-defined shapes and selecting suitable tracking regions to matching visual features across frames and displaying annotations when sufficient matching confidence was available.',
    implemented: [
      'Shape-based annotation input with adaptive tracking regions',
      'SIFT feature detection and descriptor matching',
      'Frame-by-frame tracking and annotation positioning',
      'Integration with Kurento’s video-processing pipeline',
    ],
  },
  lead: 'Camera movement makes fixed screen coordinates unsuitable for remote-assistance annotations. I separated the geometry drawn by the user from the image region used for tracking, allowing a small mark to use additional surrounding texture without changing the original geometry.',
  scopeNote:
    'This case study is a high-level reconstruction of professional work. Diagrams are illustrative. Employer source, client footage, internal configuration, and production metrics are excluded. Homography validation, reference management, selection revisions, and recovery policies below explain the reconstructed design; they are not a verified record of every mechanism shipped.',
  sections: [
    {
      id: 'annotation-and-context',
      label: 'Annotation and tracking regions',
      title: 'Separating annotation geometry from tracking regions',
      paragraphs: [
        'The implemented workflow accepted a shape type and its defining points. Small rectangles and short lines could identify something useful to a technician while containing too little distinctive texture for feature matching. Expanding the feature-detection region addressed that problem while preserving the annotation coordinates.',
        'The reconstruction also makes coordinate mapping explicit: convert displayed-video positions into decoded-frame coordinates, accounting for scaling, cropping, letterboxing, and mirroring. The captured reference image and selection must represent the same moment. Extract features from clean pixels before drawing an overlay.',
        'A larger region can include a separately moving background. Its features may dominate even when the annotation refers to a foreground object. Keep the region inside the image bounds and assess whether the added texture belongs to the intended surface; more area alone cannot establish reliable attachment.',
      ],
    },
    {
      id: 'matching-and-geometry',
      label: 'Matching and geometric validation',
      title: 'Feature matching and geometric validation',
      paragraphs: [
        "SIFT detects keypoints and computes descriptors that tolerate changes in scale and orientation, with limited tolerance for viewpoint and appearance changes. For conventional SIFT descriptors, nearest-neighbor matching uses L2, or Euclidean, distance. Lowe's ratio test compares the best and second-best candidate distances to reject ambiguous correspondences.",
        'In the reconstructed pipeline, RANSAC estimates a homography from matched coordinates. A homography models views of a planar surface, or a scene under pure camera rotation; it does not generally explain non-rigid deformation or depth-dependent parallax. Estimation needs at least four non-degenerate correspondences. Rendering also requires sufficient inlier support, low reprojection error, useful spatial coverage, and a numerically valid, plausible transformation.',
        'A geometrically consistent model can still follow the wrong surface. Background inliers may support an excellent homography while moving the annotation away from the intended object. Confidence thresholds cannot resolve that semantic error. Once a model is accepted, project the original coordinates through it: construct and transform all rectangle corners, or sample curved outlines rather than merely moving their centers.',
      ],
    },
    {
      id: 'media-and-recovery',
      label: 'Media processing and recovery',
      title: 'Media integration, processing cost, and tracking recovery',
      paragraphs: [
        'The tracking feature was integrated into a Kurento media-processing workflow. In the reconstruction, an OpenCV-based Kurento media filter reads an unannotated frame, estimates the transformation, and draws the accepted projection before forwarding the processed video.',
        'The original workflow displayed annotations when matching support was sufficient. The reconstructed recovery policy suppresses an unreliable overlay and attempts reacquisition against reference information. A fresh result must pass validation before display resumes. Selection revisions are a proposed synchronization mechanism here: results for an older annotation cannot replace a newer selection.',
        'Feature extraction, descriptor matching, and geometric estimation consume CPU time in the video path. Full detection on every frame may increase latency or create a backlog. Constrained search regions, less frequent detection, and optical flow between detections are alternatives to evaluate, not claimed production optimizations. Reducing work can also delay recovery or miss rapid motion; processing frequency needs representative footage and latency measurements.',
      ],
    },
  ],
  flow: {
    title: 'The reconstructed tracking pipeline',
    steps: [
      {
        title: 'Receive video',
        detail: 'Read a clean decoded frame from the incoming media path.',
      },
      {
        title: 'Select reference context',
        detail: 'Capture the shape points and a suitable feature-detection region.',
      },
      {
        title: 'Estimate motion',
        detail: 'Match SIFT descriptors and validate the estimated geometry.',
      },
      {
        title: 'Render the annotation',
        detail: 'Project the original shape when the current result is accepted.',
      },
    ],
  },
  decisions: [
    {
      title: 'Separate geometry and tracking context',
      choice: "Expand the feature region while preserving the user's drawing.",
      tradeoff: 'Additional features can belong to unrelated surfaces.',
    },
    {
      title: 'Validate correspondence and geometry',
      choice: 'Use descriptor filtering and robust estimation in the reconstruction.',
      tradeoff: 'Adds computation; geometric consistency does not prove correct surface selection.',
    },
    {
      title: 'Control work in the video path',
      choice:
        'Evaluate detection frequency, constrained search, and lighter intermediate tracking.',
      tradeoff: 'Lower CPU demand can reduce recovery speed or robustness during rapid motion.',
    },
    {
      title: 'Define reference and selection ownership',
      choice: 'Reconstruction: fixed-reference matching and revision-bound selection updates.',
      tradeoff:
        'Fixed references can fail after appearance changes; keyframe updates introduce drift and state-management risks.',
    },
  ],
  checks: [
    {
      scenario: 'A small rectangle contains too little texture.',
      expectation: 'Expand suitable same-surface context without enlarging the annotation.',
    },
    {
      scenario: 'Background features dominate the matches.',
      expectation:
        'Reconsider the tracking region; high inlier support alone does not establish correct attachment.',
    },
    {
      scenario: 'Occlusion or feature loss interrupts tracking.',
      expectation:
        'Continue only with sufficient support; otherwise hide the overlay until a fresh result passes validation.',
    },
    {
      scenario: 'Perspective changes distort the selected surface.',
      expectation: 'Project the original geometry and reject invalid or implausible results.',
    },
    {
      scenario: 'A selection changes during frame processing.',
      expectation:
        'In the revision-based reconstruction, discard results belonging to the earlier selection.',
    },
  ],
  takeaways: [
    'Separate annotation coordinates from feature-detection bounds so small selections can use surrounding texture.',
    'Evaluate whether matches represent the intended surface as well as whether they support a geometric model.',
    'Balance tracking reliability against processing latency, and define what users see when a result cannot be trusted.',
  ],
  references: [
    {
      label: 'OpenCV — Feature Matching + Homography',
      url: 'https://docs.opencv.org/4.x/d1/de0/tutorial_py_feature_homography.html',
    },
    {
      label: 'OpenCV — Feature Matching with FLANN',
      url: 'https://docs.opencv.org/4.x/d5/d6f/tutorial_feature_flann_matcher.html',
    },
    {
      label: 'Kurento — Writing Kurento Modules',
      url: 'https://doc-kurento.readthedocs.io/en/stable/user/writing_modules.html',
    },
  ],
};
