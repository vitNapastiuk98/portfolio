import { professionalPreviews } from '../professional-previews.data';
import type { ProfessionalStudy } from '../../models/professional-study.models';
export const visionStudy: ProfessionalStudy = {
  ...professionalPreviews[5],
  lead: 'In remote assistance, an annotation points to a physical detail rather than a fixed screen pixel. Preserving that meaning requires connecting user geometry, a reference region and changing video frames. Tracking failure must be visible instead of leaving a convincing annotation on the wrong object.',
  scopeNote:
    'Known work includes OpenCV/SIFT feature matching integrated with the Kurento video-processing environment. Ratio filtering, homography/RANSAC and validation gates below are reconstructed reference techniques, not assertions about an undocumented production algorithm.',
  sections: [
    {
      id: 'context',
      label: 'Engineering problem',
      title: 'The annotation is a relationship, not a screen coordinate',
      paragraphs: [
        'Brochesia / BView involved industrial remote assistance, live video, smart-glasses clients, AR annotations and collaboration. The computer vision work used SIFT features and matching to keep annotations positioned relative to objects as the video changed, including re-detection and tracking continuity in an OpenCV/Kurento processing context.',
        'A coordinate selected in a displayed frame belongs to that frame and viewport transform. Resizing the video, moving a camera or losing the object breaks a naïve overlay. The system must distinguish display coordinates, reference-frame coordinates and current-frame coordinates, while keeping video processing and UI selection state consistent.',
      ],
    },
    {
      id: 'geometry',
      label: 'Selection & reference',
      title: 'Expand the evidence without expanding the drawing',
      paragraphs: [
        'A tiny target selection may contain too few distinctive features. Increasing the surrounding tracking region can provide texture without changing the user’s annotation. Keep the original points or shape immutable in reference-frame coordinates, and store the tracking region as separate geometry. Otherwise an enlarged rectangle intended for matching becomes the annotation itself.',
        'Expanding context also creates a risk: nearby background features may move differently from the selected object. The reference region should therefore remain relevant to the physical surface being tracked. Re-selection or a new reference needs its own revision so results from an old selection cannot overwrite the current one.',
      ],
      diagram: {
        id: 'vision-pipeline',
        title: 'Reference annotation tracking pipeline',
        caption:
          'The original annotation points and enlarged tracking context are separate inputs. Matching and validation are reference processing responsibilities, not an exact production network diagram.',
        nodes: [
          { id: 'geometry', label: 'Original selection', detail: 'Immutable reference points' },
          { id: 'roi', label: 'Tracking context', detail: 'Larger useful image region' },
          { id: 'features', label: 'SIFT correspondence', detail: 'Reference ↔ live frame' },
          { id: 'render', label: 'Display annotation', detail: 'Current video coordinates' },
          { id: 'project', label: 'Transform points', detail: 'Original geometry only' },
          { id: 'validate', label: 'Validate estimate', detail: 'Reject unreliable motion' },
        ],
        edges: [
          { from: 'geometry', to: 'roi' },
          { from: 'roi', to: 'features' },
          { from: 'features', to: 'validate' },
          { from: 'validate', to: 'project' },
          { from: 'project', to: 'render' },
        ],
      },
      codeExamples: [
        {
          title: 'Separate the user’s geometry from the matching region',
          language: 'typescript',
          code: `interface Point { readonly x: number; readonly y: number; }
interface SelectionReference {
  readonly selectionRevision: number;
  readonly frameId: string;
  readonly annotation: readonly Point[];
  readonly trackingRegion: { x: number; y: number; width: number; height: number };
}
// Clamp an expanded tracking region to the reference image bounds.
// Never replace annotation with the expanded region's corners.
// Convert viewport clicks through the video content rectangle first;
// letterboxing and CSS scaling are not camera motion.`,
        },
      ],
    },
    {
      id: 'matching',
      label: 'Reference implementation',
      title: 'Estimate motion only from credible correspondences',
      paragraphs: [
        'SIFT produces keypoints and descriptors that can be compared between reference and current image regions. Descriptor similarity proposes correspondences; it does not prove that all of them describe the same surface. A representative pipeline compares nearest neighbors, rejects ambiguous matches and estimates a robust transform from the remaining pairs.',
        'A homography models projective motion of a roughly planar surface, or other situations where that mapping is a reasonable approximation. It is not general 3D tracking. RANSAC can reject outliers, but a small cluster of repetitive texture can still support a misleading model. Use geometric coverage, reprojection error, inlier support and plausibility as candidate validation checks rather than relying on a single match count.',
      ],
      codeExamples: [
        {
          title: 'Representative OpenCV-style pseudocode',
          language: 'text',
          code: `referenceKeypoints, referenceDescriptors = SIFT(referenceRegion)
currentKeypoints, currentDescriptors = SIFT(currentFrame)
nearestPairs = descriptorMatcher.knnMatch(referenceDescriptors, currentDescriptors, k=2)
credible = pairs where both neighbors exist and nearest.distance < policy.ratio * second.distance
if credible has fewer than 4 usable, non-degenerate point pairs: return TRACKING_UNAVAILABLE
H, inliers = findHomography(referencePoints, currentPoints, RANSAC)
if H is missing or fails geometric checks: return TRACKING_UNAVAILABLE
if inlier support, coverage or reprojection error fails policy: return TRACKING_UNAVAILABLE
return transform(originalAnnotationPoints, H)`,
          explanation:
            'These are recommended/reconstructed steps. Detector availability and cost depend on the OpenCV build and image conditions. Thresholds need calibration on representative footage; none are presented as a historical production setting.',
        },
      ],
    },
    {
      id: 'projection',
      label: 'Geometry & failure handling',
      title: 'Project the original points and reject stale results',
      paragraphs: [
        'For a homography H mapping reference to current coordinates, a point is projected in homogeneous coordinates and divided by its third coordinate. Reject near-zero denominators and non-finite results. Check the transformed shape for implausible distortion before displaying it. Applying transforms repeatedly to the last displayed points can accumulate drift; retain the original reference geometry.',
        'Temporary disappearance is a state transition: tracking, uncertain/unavailable and reacquiring need different display policies. Suppress an unreliable overlay, preserve the reference and attempt re-detection when useful evidence returns. Every result must match the active selection revision and stream identity. A late result from an older frame may be mathematically valid and still be the wrong UI state.',
      ],
      codeExamples: [
        {
          title: 'Reference-to-current coordinate projection',
          language: 'text',
          code: `w = H20*x + H21*y + H22
if abs(w) < policy.minimumDenominator: reject
xCurrent = (H00*x + H01*y + H02) / w
yCurrent = (H10*x + H11*y + H12) / w
if not finite(xCurrent, yCurrent): reject
if result.selectionRevision != activeSelection.revision: discard
if result.streamId != activeStream.id: discard
apply display scaling/letterboxing only after the image-space projection`,
        },
      ],
    },
    {
      id: 'integration',
      label: 'Media integration & constraints',
      title: 'Keep processing cost and UI authority visible',
      paragraphs: [
        'Kurento integration places matching and annotation processing in a media-processing environment rather than treating it as a purely Angular drawing problem. The UI still owns selection intent and explains tracking state. Smart-glasses and web clients add differences in frame orientation, display scaling, bandwidth and available tracking support.',
        'Live video has a frame budget: a more expensive detector or a larger region may improve evidence while increasing latency. Bounded processing queues and dropping obsolete frames are reference strategies to prefer fresh output over an ever-growing backlog. Textureless surfaces, motion blur, occlusion, lighting changes and non-planar movement remain limitations. Do not turn a successful demonstration on textured footage into a universal tracking claim.',
      ],
    },
  ],
  flow: {
    title: 'From user intent to an evidence-backed overlay',
    steps: [
      {
        title: 'Capture reference',
        detail: 'Store original geometry, tracking context and selection identity separately.',
      },
      {
        title: 'Match evidence',
        detail: 'Find reference/current correspondences for the relevant surface.',
      },
      {
        title: 'Accept or reject motion',
        detail: 'Validate the transform; unavailable is preferable to a confident wrong overlay.',
      },
      {
        title: 'Render current geometry',
        detail:
          'Project original points and apply display mapping only for the active stream/selection.',
      },
    ],
  },
  decisions: [
    {
      title: 'Larger reference context',
      choice: 'Expand tracking evidence around a small selection.',
      tradeoff: 'More texture can help, but unrelated background motion can contaminate matching.',
    },
    {
      title: 'Projective model',
      choice: 'Use a homography when the surface/motion assumptions fit.',
      tradeoff: 'It cannot represent arbitrary non-planar or independently moving geometry.',
    },
    {
      title: 'Failure-aware display',
      choice: 'Suppress unreliable/stale overlays and retain a reacquisition reference.',
      tradeoff:
        'Temporary absence is more visible than leaving the last overlay frozen, but is more honest.',
    },
  ],
  checks: [
    {
      scenario: 'Tiny selected rectangle',
      expectation:
        'Expand only the tracking context; original annotation coordinates remain unchanged.',
    },
    {
      scenario: 'Object disappears and returns',
      expectation:
        'Show unavailable/reacquiring behavior and accept a new result only with suitable evidence.',
    },
    {
      scenario: 'Repetitive texture or motion blur',
      expectation:
        'Candidate matching can fail validation rather than producing an unjustified overlay.',
    },
    {
      scenario: 'Selection changes during processing',
      expectation: 'Discard results for the old revision before they reach the visible annotation.',
    },
  ],
  takeaways: [
    'User geometry and tracking evidence are different state.',
    'A transform is useful only within its geometric assumptions and active UI identity.',
    'Failure handling is as important to remote guidance as successful feature matching.',
  ],
  references: [
    {
      label: 'OpenCV — Feature matching and homography',
      url: 'https://docs.opencv.org/4.x/d1/de0/tutorial_py_feature_homography.html',
    },
    {
      label: 'OpenCV — SIFT',
      url: 'https://docs.opencv.org/4.x/da/df5/tutorial_py_sift_intro.html',
    },
    { label: 'Kurento documentation', url: 'https://doc-kurento.readthedocs.io/' },
  ],
  related: [
    {
      label: 'Detailed tracking geometry and matching illustrations',
      path: '/engineering/opencv-anchored-annotations',
    },
    { label: 'Reliable real-time systems', path: '/case-studies/real-time-systems' },
  ],
};
