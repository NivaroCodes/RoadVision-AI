# Training Dataset Preparation Report

## Dataset
* **Total Images:** 38386
* **Total Annotations:** 55007
* **Total Classes:** 4

## Mapping
RDD2022 classes are kept as independent labels for the baseline YOLO training.
Semantic mapping to Jol Scan product spec will be handled at the API/Inference level:
* D00 (Longitudinal Crack) -> `crack`
* D10 (Transverse Crack) -> `crack`
* D20 (Alligator Crack) -> `crack`
* D40 (Pothole) -> `pothole`

## Split
* **Train:** 30708 images
* **Validation:** 3839 images
* **Test:** 3839 images
* **Seed:** 42

### Class Distribution per Split
| Class | Train | Validation | Test | Total |
|---|---|---|---|---|
| D00 | 20627 | 2715 | 2674 | 26016 |
| D10 | 9454 | 1227 | 1150 | 11831 |
| D20 | 8402 | 1134 | 1079 | 10615 |
| D40 | 5193 | 707 | 645 | 6545 |

## Class Imbalance
* D00: 47.3%
* D10: 21.5%
* D20: 19.3%
* D40: 11.9%

*Note: Imbalance is severe (D00 dominates, D40 is rare). Focal loss or class weights should be considered if the baseline underperforms on D40.*

## Output
* **Dataset Path:** C:\Users\nivar\PycharmProjects\RoadVision-AI\ml\data\training
* **YAML Path:** C:\Users\nivar\PycharmProjects\RoadVision-AI\ml\data\training\dataset.yaml
* **Status:** READY FOR BASELINE TRAINING
