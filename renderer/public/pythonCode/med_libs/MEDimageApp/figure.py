import numpy as np
import plotly.graph_objects as go
from skimage import measure


def frame_args(duration):
    return {
        "frame": {"duration": duration},
        "mode": "immediate",
        "fromcurrent": True,
        "transition": {"duration": duration, "easing": "linear"},
    }


class Figure:
    def __init__(self, vol, fig_title, mask=None):
        self.sliders = None
        self.fig_title = fig_title
        self.volume = vol.T
        self.x, self.y = self.volume[0].shape
        self.nb_frames = self.volume.shape[0]
        self.mask = mask
        # Store maximum intensity of volume to avoid computing it multiple times later
        self.max = np.max(self.volume)

        if self.mask is not None:
            self.mask = mask.T
            # TODO : This is a temporary solution to the problem of visualization of ROIs. The optimal solution
            #  would include a separate matrix for the ROIs, so that they could be represented better with plotly
            #  (use of a legend, colored ROIs, selection of different ROIs...)
            mask_points = [[] for x in range(self.nb_frames)]
            for k in range(self.nb_frames):
                # Finding contour in plane with scikit-image
                mask_points[k] = measure.find_contours(self.mask[k, :, :])
                for array in range(len(mask_points[k])):
                    # For each point in every contour found in plane by scikit-image, set volume intensity to maximum
                    mask_points[k][array] = [[int(j) for j in i] for i in mask_points[k][array]]
                    for point in range(len(mask_points[k][array])):
                        mask_point = mask_points[k][array][point]
                        self.volume[k][mask_point[0]][mask_point[1]] = self.max


        # Figure initialization with plotly graph object
        self.fig = go.Figure(frames=[go.Frame(data=[go.Surface(
            z=(self.nb_frames - 1 - k) * np.ones((self.x, self.y)),
            surfacecolor=np.flipud(self.volume[self.nb_frames - 1 - k]),
            cmin=np.min(self.volume), cmax=np.max(self.volume)
        ), ],
            name=str(k)  # you need to name the frame for the animation to behave properly
        )
            for k in range(self.nb_frames)])

    def add_data(self):
        # Add data to be displayed before animation starts
        self.fig.add_trace(go.Surface(
            z=(self.nb_frames - 1) * np.ones((self.x, self.y)),
            surfacecolor=np.flipud(self.volume[self.nb_frames - 1]),
            colorscale='Gray',
            cmin=np.min(self.volume), cmax=np.max(self.volume),
            colorbar=dict(thickness=20, ticklen=4)
        ))

        return self

    def create_figure_sliders(self):
        self.sliders = [
            {
                "pad": {"b": 10, "t": 60},
                "len": 0.9,
                "x": 0.1,
                "y": 0,
                "steps": [
                    {
                        "args": [[f.name], frame_args(0)],
                        "label": str(k),
                        "method": "animate",
                    }
                    for k, f in enumerate(self.fig.frames)
                ],
            }
        ]
        return self

    def update_figure_layout(self):
        self.fig.update_layout(
            title=self.fig_title,
            width=800,
            height=800,
            scene=dict(
                zaxis=dict(range=[0, self.nb_frames], autorange=False),
                aspectratio=dict(x=1, y=1, z=1),
            ),
            updatemenus=[
                {
                    "buttons": [
                        {
                            "args": [None, frame_args(50)],
                            "label": "&#9654;",  # play symbol
                            "method": "animate",
                        },
                        {
                            "args": [[None], frame_args(0)],
                            "label": "&#9724;",  # pause symbol
                            "method": "animate",
                        },
                    ],
                    "direction": "left",
                    "pad": {"r": 10, "t": 70},
                    "type": "buttons",
                    "x": 0,
                    "y": 0,
                }
            ],
            sliders=self.sliders
        )
        return self

    def show_figure(self):
        self.fig.show(renderer="browser")
