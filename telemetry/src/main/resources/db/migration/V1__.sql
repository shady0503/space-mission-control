-- enable the pgcrypto extension so gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE satellite_reference
(
    id            UUID   NOT NULL DEFAULT gen_random_uuid(),
    external_id   BIGINT NOT NULL,
    enterprise_id UUID   NOT NULL,
    CONSTRAINT pk_satellite_reference PRIMARY KEY (id)
);

CREATE TABLE trajectory_data
(
    external_id     BIGINT                      NOT NULL,
    timestamp       TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    position_x      FLOAT                       NOT NULL,
    position_y      FLOAT                       NOT NULL,
    position_z      FLOAT                       NOT NULL,
    velocity_x      FLOAT                       NOT NULL,
    velocity_y      FLOAT                       NOT NULL,
    velocity_z      FLOAT                       NOT NULL,
    velocity        FLOAT                       NOT NULL,
    acceleration    FLOAT                       NOT NULL,
    orbit_radius    FLOAT                       NOT NULL,
    sat_latitude    FLOAT,
    sat_longitude   FLOAT,
    sat_altitude    FLOAT,
    azimuth         FLOAT,
    elevation       FLOAT,
    right_ascension FLOAT,
    declination     FLOAT,
    CONSTRAINT pk_trajectory_data PRIMARY KEY (external_id, timestamp)
);

-- enable TimescaleDB and create a hypertable
CREATE EXTENSION IF NOT EXISTS timescaledb;
SELECT create_hypertable(
               'trajectory_data',
               'timestamp',
               if_not_exists => TRUE
       );
